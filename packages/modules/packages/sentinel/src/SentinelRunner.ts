import { assertEx } from '@xylabs/assert'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { SentinelAutomationPayload, SentinelIntervalAutomationPayload } from './Automation'
import { SentinelIntervalAutomationWrapper } from './SentinelIntervalAutomationWrapper'
import { SentinelModel } from './SentinelModel'

export type OnSentinelRunnerTriggerResult = (result: [XyoBoundWitness | null, XyoPayload[]]) => void

export class SentinelRunner {
  protected _automations: Record<string, SentinelAutomationPayload> = {}
  protected onTriggerResult: OnSentinelRunnerTriggerResult | undefined
  protected sentinel: SentinelModel
  protected timeoutId?: NodeJS.Timer

  constructor(sentinel: SentinelModel, automations?: SentinelAutomationPayload[], onTriggerResult?: OnSentinelRunnerTriggerResult) {
    this.sentinel = sentinel
    this.onTriggerResult = onTriggerResult
    automations?.forEach((automation) => this.add(automation))
  }

  public get automations() {
    return this._automations
  }

  private get next() {
    return Object.values(this._automations).reduce<SentinelIntervalAutomationPayload | undefined>((previous, current) => {
      if (current.type === 'interval') {
        return current.start < (previous?.start ?? Infinity) ? current : previous
      }
    }, undefined)
  }

  public async add(automation: SentinelAutomationPayload, restart = true) {
    const hash = new PayloadWrapper(automation).hash
    this._automations[hash] = automation
    if (restart) await this.restart()
    return hash
  }

  public find(hash: string) {
    Object.entries(this._automations).find(([key]) => key === hash)
  }

  public async remove(hash: string, restart = true) {
    delete this._automations[hash]
    if (restart) await this.restart()
  }

  public removeAll() {
    this.stop()
    this._automations = {}
  }

  public async restart() {
    this.stop()
    await this.start()
  }

  public async start() {
    assertEx(this.timeoutId === undefined, 'Already started')
    const automation = this.next
    if (automation) {
      const delay = automation.start - Date.now()
      if (delay < 0) {
        //automation is due, just do it
        await this.trigger(automation)
      } else {
        this.timeoutId = setTimeout(
          async () => {
            this.timeoutId = undefined
            await this.start()
          },
          delay > 0 ? delay : 0,
        )
      }
    }
  }

  public stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  public async update(hash: string, automation: SentinelAutomationPayload, restart = true) {
    await this.remove(hash, false)
    await this.add(automation, false)
    if (restart) await this.restart()
  }

  private async trigger(automation: SentinelIntervalAutomationPayload) {
    const wrapper = new SentinelIntervalAutomationWrapper(automation)
    await this.remove(wrapper.hash, false)
    wrapper.next()
    await this.add(wrapper.payload, false)
    const triggerResult = await this.sentinel.tryReport()
    this.onTriggerResult?.(triggerResult)
    await this.start()
  }
}
