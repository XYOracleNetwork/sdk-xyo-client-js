import { Value } from './Payload'
import { ValueSchema } from './Schema'

export const valuePayloadTemplate = (): Value => ({
  schema: ValueSchema,
  value: undefined,
})
