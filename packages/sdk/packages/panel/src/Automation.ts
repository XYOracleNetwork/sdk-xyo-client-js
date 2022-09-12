import { EmptyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload'

export type XyoAutomationSchema = 'network.xyo.automation'
export const XyoAutomationSchema = 'network.xyo.automation'

export type XyoPanelBaseAutomationPayload<T extends EmptyObject = EmptyObject> = XyoPayload<
  T & {
    /** @field The list of witnesses to invoke [all if undefined] */
    witnesses?: string[]
    type?: 'interval' | 'change'
    schema: XyoAutomationSchema
  }
>

export type XyoPanelIntervalAutomationPayload = XyoPanelBaseAutomationPayload<{
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
}>

export type XyoPanelChangeAutomationPayload = XyoPanelBaseAutomationPayload<{
  type: 'change'
}>

export type XyoPanelAutomationPayload = XyoPanelIntervalAutomationPayload | XyoPanelChangeAutomationPayload
