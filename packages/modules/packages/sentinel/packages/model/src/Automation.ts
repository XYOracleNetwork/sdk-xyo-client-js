import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export const SentinelAutomationSchema = 'network.xyo.automation' as const
export type SentinelAutomationSchema = typeof SentinelAutomationSchema

export const SentinelIntervalAutomationSchema = 'network.xyo.automation.interval' as const
export type SentinelIntervalAutomationSchema = typeof SentinelIntervalAutomationSchema

export const SentinelEventAutomationSchema = 'network.xyo.automation.event' as const
export type SentinelEventAutomationSchema = typeof SentinelEventAutomationSchema

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
  frequencyUnits?: 'second' | 'minute' | 'hour' | 'day' | 'millis'

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
