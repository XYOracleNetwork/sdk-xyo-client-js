import { assertEx } from '@xylabs/assert'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import {
  isSentinelIntervalAutomation,
  SentinelAutomationPayload,
  SentinelInstance,
  SentinelIntervalAutomationPayload,
} from '@xyo-network/sentinel-model'

import { SentinelIntervalAutomationWrapper } from './SentinelIntervalAutomationWrapper'

export type OnSentinelRunnerTriggerResult = (result: Payload[]) => void

export class SentinelRunner {
  protected _automations: Record<string, SentinelAutomationPayload> = {}
  protected onTriggerResult: OnSentinelRunnerTriggerResult | undefined
  protected sentinel: SentinelInstance
  protected timeoutId?: NodeJS.Timeout | string | number

  constructor(sentinel: SentinelInstance, automations?: SentinelAutomationPayload[], onTriggerResult?: OnSentinelRunnerTriggerResult) {
    this.sentinel = sentinel
    this.onTriggerResult = onTriggerResult
    if (automations) for (const automation of automations) this.add(automation)
  }

  get automations() {
    return this._automations
  }

  private get next() {
    // eslint-disable-next-line unicorn/no-array-reduce
    return Object.values(this._automations).reduce<SentinelAutomationPayload | undefined>((previous, current) => {
      if (isSentinelIntervalAutomation(current) && isSentinelIntervalAutomation(previous)) {
        return current.start < (previous?.start ?? Number.POSITIVE_INFINITY) ? current : previous
      }
      return current
      // eslint-disable-next-line unicorn/no-useless-undefined
    }, undefined)
  }

  async add(automation: SentinelAutomationPayload, restart = true) {
    const hash = await PayloadWrapper.hashAsync(automation)
    this._automations[hash] = automation
    if (restart) await this.restart()
    return hash
  }

  find(hash: string) {
    Object.entries(this._automations).find(([key]) => key === hash)
  }

  async remove(hash: string, restart = true) {
    delete this._automations[hash]
    if (restart) await this.restart()
  }

  removeAll() {
    this.stop()
    this._automations = {}
  }

  async restart() {
    this.stop()
    await this.start()
  }

  async start() {
    // NOTE: Keep async to match module start signature
    await Promise.resolve()
    assertEx(this.timeoutId === undefined, 'Already started')
    const automation = this.next
    if (isSentinelIntervalAutomation(automation)) {
      const now = Date.now()
      const start = Math.max(automation.start ?? now, now)
      const delay = Math.max(start - now, 0)
      if (delay < Number.POSITIVE_INFINITY) {
        this.timeoutId = setTimeout(async () => {
          try {
            // Run the automation
            await this.trigger(automation)
            this.stop()
          } finally {
            // No matter what start the next automation
            await this.start()
          }
        }, delay)
      }
    }
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  async update(hash: string, automation: SentinelAutomationPayload, restart = true) {
    await this.remove(hash, false)
    await this.add(automation, false)
    if (restart) await this.restart()
  }

  private async trigger(automation: SentinelIntervalAutomationPayload) {
    const wrapper = new SentinelIntervalAutomationWrapper(automation)
    await this.remove(await wrapper.hashAsync(), false)
    wrapper.next()
    await this.add(wrapper.jsonPayload(), false)
    const triggerResult = await this.sentinel.report()
    this.onTriggerResult?.(triggerResult)
    // await this.start()
  }
}