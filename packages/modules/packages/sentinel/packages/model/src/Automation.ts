import type { EventName } from '@xylabs/sdk-js'
import type { ModuleIdentifier } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'
import { asSchema, isPayloadOfSchemaType } from '@xyo-network/payload-model'

export const SentinelAutomationSchema = asSchema('network.xyo.automation', true)
export type SentinelAutomationSchema = typeof SentinelAutomationSchema

export const SentinelIntervalAutomationSchema = asSchema('network.xyo.automation.interval', true)
export type SentinelIntervalAutomationSchema = typeof SentinelIntervalAutomationSchema

export const SentinelModuleEventAutomationSchema = asSchema('network.xyo.automation.event.module', true)
export type SentinelModuleEventAutomationSchema = typeof SentinelModuleEventAutomationSchema

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

/** Settings for an Module Event Automation */
export type SentinelModuleEventAutomationPayload = SentinelBaseAutomationPayload<{
  eventName: EventName
  schema: SentinelModuleEventAutomationSchema
  source: ModuleIdentifier
  type: 'event'
}>

/** Settings for an Automation */
export type SentinelAutomationPayload = Payload<
  SentinelIntervalAutomationPayload | SentinelModuleEventAutomationPayload,
  SentinelAutomationSchema | SentinelIntervalAutomationSchema | SentinelModuleEventAutomationSchema
>
