/* eslint-disable deprecation/deprecation */
import { AnyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload-model'

/** @deprecated use Sentinel version instead */
export type XyoAutomationSchema = 'network.xyo.automation'

/** @deprecated use Sentinel version instead */
export const XyoAutomationSchema = 'network.xyo.automation'

/** @deprecated use Sentinel version instead */
export type XyoPanelBaseAutomationPayload<T extends AnyObject = AnyObject> = XyoPayload<
  T & {
    schema: XyoAutomationSchema
    type?: 'interval' | 'change'
    /** @field The list of witnesses to invoke [all if undefined] */
    witnesses?: string[]
  }
>

/** @deprecated use Sentinel version instead */
export type XyoPanelIntervalAutomationPayload = XyoPanelBaseAutomationPayload<{
  /** @field epoch after which any reoccurrence stops */
  end?: number

  /** @field time between triggers [non-repeating if undefined] */
  frequency?: number

  /** @field units for frequency field [hour if undefined] */
  frequencyUnits?: 'minute' | 'hour' | 'day'

  /** @field remaining triggers [infinite if undefined] */
  remaining?: number

  /** @field epoch of the next trigger */
  start: number

  type: 'interval'
}>

/** @deprecated use Sentinel version instead */
export type XyoPanelChangeAutomationPayload = XyoPanelBaseAutomationPayload<{
  type: 'change'
}>

/** @deprecated use Sentinel version instead */
export type XyoPanelAutomationPayload = XyoPanelIntervalAutomationPayload | XyoPanelChangeAutomationPayload
