import { Value } from './Payload.js'
import { ValueSchema } from './Schema.js'

export const valuePayloadTemplate = (): Value => ({
  schema: ValueSchema,
  value: null,
})
