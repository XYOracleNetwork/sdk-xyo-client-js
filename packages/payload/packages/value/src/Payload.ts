import { JsonValue } from '@xylabs/object'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ValueSchema } from './Schema'

export type Value<T extends JsonValue = JsonValue> = Payload<{
  schema: ValueSchema
  value: T
}>

export const isValuePayload = isPayloadOfSchemaType<Value>(ValueSchema)
