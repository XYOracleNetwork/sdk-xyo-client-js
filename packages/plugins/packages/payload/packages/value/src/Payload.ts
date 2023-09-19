import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ValueSchema } from './Schema'

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]

export type Value<T extends JsonValue = JsonValue> = Payload<{
  schema: ValueSchema
  value: T
}>

export const isValuePayload = isPayloadOfSchemaType<Value>(ValueSchema)
