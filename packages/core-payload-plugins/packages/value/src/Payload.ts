import type { JsonValue } from '@xylabs/object'
import type { Payload } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType, isPayloadOfSchemaTypeWithMeta } from '@xyo-network/payload-model'

import { ValueSchema } from './Schema.ts'

export type Value<T extends JsonValue = JsonValue> = Payload<{
  schema: ValueSchema
  value: T
}>

export const isValuePayload = isPayloadOfSchemaType<Value>(ValueSchema)
export const isValuePayloadWithMeta = isPayloadOfSchemaTypeWithMeta<Value>(ValueSchema)
