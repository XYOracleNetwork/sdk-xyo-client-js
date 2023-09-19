import { Payload } from '@xyo-network/payload-model'

import { ValueSchema } from './Schema'

type JsonValue = string | number | boolean | null | JsonObject | JsonArray
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]

export type ValueInstance<T extends JsonValue = JsonValue> = T | undefined

export type Value<T extends JsonValue = JsonValue> = Payload<{
  schema: ValueSchema
  value: T
}>
