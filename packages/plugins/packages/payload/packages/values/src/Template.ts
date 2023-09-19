import { Values } from './Payload'
import { ValuesSchema } from './Schema'

export const valuesPayloadTemplate = (): Values => ({
  schema: ValuesSchema,
  values: {},
})
