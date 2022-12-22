import { assertEx } from '@xylabs/assert'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { XyoPanelAutomationPayload, XyoPanelIntervalAutomationPayload } from './Automation'
import { XyoPanelIntervalAutomationWrapper } from './XyoAutomationWrapper'
import { XyoPanel } from './XyoPanel'

export class XyoPanelRunner {
  protected _automations: Record<string, XyoPanelAutomationPayload> = {}
  protected panel: XyoPanel
  protected timeoutId?: NodeJS.Timer
  constructor(panel: XyoPanel, automations?: XyoPanelAutomationPayload[]) {
    this.panel = panel
    automations?.forEach((automation) => this.add(automation))
  }

  public get automations() {
    return this._automations
  }

  private get next() {
    return Object.values(this._automations).reduce<XyoPanelIntervalAutomationPayload | undefined>((previous, current) => {
      if (current.type === 'interval') {
        return current.start < (previous?.start ?? Infinity) ? current : previous
      }
    }, undefined)
  }

  public async add(automation: XyoPanelAutomationPayload, restart = true) {
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

  public async update(hash: string, automation: XyoPanelAutomationPayload, restart = true) {
    await this.remove(hash, false)
    await this.add(automation, false)
    if (restart) await this.restart()
  }

  private async trigger(automation: XyoPanelIntervalAutomationPayload) {
    const wrapper = new XyoPanelIntervalAutomationWrapper(automation)
    await this.remove(wrapper.hash, false)
    wrapper.next()
    await this.add(wrapper.payload, false)
    await this.panel.report()
    await this.start()
  }
}
