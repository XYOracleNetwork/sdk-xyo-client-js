import { XyoPayload } from '@xyo-network/payload'

export interface XyoPanelBaseAutomationPayload extends XyoPayload {
  /** @field The list of witnesses to invoke [all if undefined] */
  witnesses?: string[]
  type?: 'interval' | 'change'
  schema: 'network.xyo.automation'
}

export type XyoPanelIntervalAutomationPayload = XyoPanelBaseAutomationPayload & {
  type: 'interval'

  /** @field epoch of the next trigger */
  start: number

  /** @field epoch after which any reoccurance stops */
  end?: number

  /** @field time between triggers [non-repeating if undefined] */
  frequency?: number

  /** @field units for frequency field [hour if undefined] */
  frequencyUnits?: 'minute' | 'hour' | 'day'

  /** @field remaining triggers [infinite if undefined] */
  remaining?: number
}

export type XyoPanelChangeAutomationPayload = XyoPanelBaseAutomationPayload & {
  type: 'change'
}

export type XyoPanelAutomationPayload = XyoPanelIntervalAutomationPayload | XyoPanelChangeAutomationPayload
