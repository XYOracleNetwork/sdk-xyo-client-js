import type { Value } from './Payload.ts'
import { ValueSchema } from './Schema.ts'

export const valuePayloadTemplate = (): Value => ({
  schema: ValueSchema,
  value: null,
})
