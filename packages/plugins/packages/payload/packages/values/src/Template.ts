import { ValuesPayload } from './Payload'
import { ValuesSchema } from './Schema'

export const valuesPayloadTemplate = (): ValuesPayload => ({
  schema: ValuesSchema,
  values: undefined,
})
