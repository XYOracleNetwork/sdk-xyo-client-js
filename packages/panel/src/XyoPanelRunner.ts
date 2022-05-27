import { XyoPayloadWrapper } from '@xyo-network/core'

import { XyoPanelAutomationPayload, XyoPanelIntervalAutomationPayload } from './Automation'
import { XyoPanelIntervalAutomationWrapper } from './XyoAutomationWrapper'
import { XyoPanel } from './XyoPanel'

export class XyoPanelRunner {
  protected panel: XyoPanel
  protected automations: Record<string, XyoPanelAutomationPayload> = {}
  protected timeoutId?: NodeJS.Timer
  constructor(panel: XyoPanel, automations?: XyoPanelAutomationPayload[]) {
    this.panel = panel
    automations?.forEach((automation) => this.add(automation))
  }

  private get next() {
    return Object.values(this.automations).reduce<XyoPanelIntervalAutomationPayload | undefined>((previous, current) => {
      if (current.type === 'interval') {
        return current.start < (previous?.start ?? Infinity) ? current : previous
      }
    }, undefined)
  }

  private async trigger(automation: XyoPanelIntervalAutomationPayload) {
    const wrapper = new XyoPanelIntervalAutomationWrapper(automation)
    this.remove(wrapper.hash)
    wrapper.next()
    this.add(wrapper.payload)
    await this.panel.report()
    await this.start()
  }

  public async start() {
    const automation = this.next
    if (automation) {
      const delay = automation.start - Date.now()
      if (delay < 0) {
        await this.trigger(automation)
      }
      this.timeoutId = setTimeout(
        async () => {
          await this.start()
        },
        delay > 0 ? delay : 0
      )
    }
  }

  public find(schema: string) {
    return Object.entries(this.automations).find(([key]) => key === schema)
  }

  public stop() {
    if (this.timeoutId) {
      clearInterval(this.timeoutId)
    }
  }

  public add(automation: XyoPanelAutomationPayload) {
    const hash = new XyoPayloadWrapper(automation).hash
    this.automations[hash] = automation
    return hash
  }

  public remove(hash: string) {
    delete this.automations[hash]
  }

  public removeAll() {
    this.automations = {}
  }
}
