import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export type SentinelAutomationSchema = 'network.xyo.automation'
export const SentinelAutomationSchema: SentinelAutomationSchema = 'network.xyo.automation'

export type SentinelIntervalAutomationSchema = 'network.xyo.automation.interval'
export const SentinelIntervalAutomationSchema: SentinelIntervalAutomationSchema = 'network.xyo.automation.interval'

export type SentinelEventAutomationSchema = 'network.xyo.automation.event'
export const SentinelEventAutomationSchema: SentinelEventAutomationSchema = 'network.xyo.automation.event'

export type SentinelBaseAutomationPayload<T extends Payload> = Payload<
  {
    type?: 'interval' | 'event'
  } & T
>

/** Settings for an Interval Automation */
export type SentinelIntervalAutomationPayload = SentinelBaseAutomationPayload<{
  /** Epoch after which any reoccurrence stops */
  end?: number

  /** Time between triggers [non-repeating if undefined] */
  frequency?: number

  /** Units for frequency field [hour if undefined] */
  frequencyUnits?: 'second' | 'minute' | 'hour' | 'day'

  /** Remaining triggers [infinite if undefined] */
  remaining?: number

  schema: SentinelIntervalAutomationSchema

  /** Epoch of the next trigger */
  start: number

  /** The type of automation */
  type: 'interval'
}>

export const isSentinelIntervalAutomation = isPayloadOfSchemaType<SentinelIntervalAutomationPayload>(SentinelIntervalAutomationSchema)

/** Settings for an Event Automation */
export type SentinelEventAutomationPayload = SentinelBaseAutomationPayload<{
  schema: SentinelEventAutomationSchema
  type: 'event'
}>

/** Settings for an Automation */
export type SentinelAutomationPayload = Payload<
  SentinelIntervalAutomationPayload | SentinelEventAutomationPayload,
  SentinelAutomationSchema | SentinelIntervalAutomationSchema | SentinelEventAutomationSchema
>
