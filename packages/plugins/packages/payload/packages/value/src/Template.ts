import { ValuePayload } from './Payload'
import { ValueSchema } from './Schema'

export const valuePayloadTemplate = (): ValuePayload => ({
  schema: ValueSchema,
  value: undefined,
})
