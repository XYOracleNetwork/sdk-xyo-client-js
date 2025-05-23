import { assertEx } from '@xylabs/assert'
import type { BaseParams } from '@xylabs/base'
import { Base } from '@xylabs/base'
import { forget } from '@xylabs/forget'
import { spanRootAsync } from '@xylabs/telemetry'
import { isDefined } from '@xylabs/typeof'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import type {
  SentinelAutomationPayload,
  SentinelInstance,
  SentinelIntervalAutomationPayload,
} from '@xyo-network/sentinel-model'
import { isSentinelIntervalAutomation } from '@xyo-network/sentinel-model'

import { SentinelIntervalAutomationWrapper } from './SentinelIntervalAutomationWrapper.ts'

export type OnSentinelRunnerTriggerResult = (result: Payload[]) => void

export interface SentinelRunnerParams extends BaseParams {
  automations?: SentinelAutomationPayload[]
  onTriggerResult?: OnSentinelRunnerTriggerResult
  sentinel: SentinelInstance
}

export class SentinelRunner extends Base {
  protected _automations: Record<string, SentinelAutomationPayload> = {}
  protected onTriggerResult: OnSentinelRunnerTriggerResult | undefined
  protected sentinel: SentinelInstance
  protected timeoutId?: NodeJS.Timeout | string | number

  constructor(params: SentinelRunnerParams) {
    super(params)
    this.sentinel = params.sentinel
    this.onTriggerResult = params.onTriggerResult
    // eslint-disable-next-line sonarjs/no-async-constructor
    if (params.automations) for (const automation of params.automations) forget(this.add(automation))
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
    const hash = await PayloadBuilder.dataHash(automation)
    this._automations[hash] = automation
    if (restart) this.restart()
    return hash
  }

  find(hash: string) {
    return Object.entries(this._automations).find(([key]) => key === hash)
  }

  remove(hash: string, restart = true) {
    delete this._automations[hash]
    if (restart) this.restart()
  }

  removeAll() {
    this.stop()
    this._automations = {}
  }

  restart() {
    this.stop()
    this.start()
  }

  start() {
    this.startHandler()
  }

  startHandler() {
    assertEx(this.timeoutId === undefined, () => 'Already started')
    const automation = this.next
    if (isSentinelIntervalAutomation(automation)) {
      const now = Date.now()
      const start = Math.max(automation.start ?? now, now)
      const delay = Math.max(start - now, 0)
      if (delay < Number.POSITIVE_INFINITY) {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.timeoutId = setTimeout(async () => {
          this.timeoutId = undefined
          return await spanRootAsync('start.setTimeout', async () => {
            try {
            // Run the automation
              await this.trigger(automation)
              this.stop()
            } catch (ex) {
              this.logger?.error('Error running automation', { error: ex })
              this.stop()
            } finally {
              // No matter what start the next automation
              this.start()
            }
          }, this.tracer)
        }, delay)
      }
    }
  }

  stop() {
    if (isDefined(this.timeoutId)) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  async update(hash: string, automation: SentinelAutomationPayload, restart = true) {
    this.remove(hash, false)
    await this.add(automation, false)
    if (restart) this.restart()
  }

  private async trigger(automation: SentinelIntervalAutomationPayload) {
    return await spanRootAsync('trigger', async () => {
      const wrapper = new SentinelIntervalAutomationWrapper(automation)
      this.remove(await wrapper.dataHash(), false)
      wrapper.next()
      await this.add(wrapper.payload, false)
      const triggerResult = await this.sentinel.report()
      this.onTriggerResult?.(triggerResult)
    }, this.tracer)
  }
}
