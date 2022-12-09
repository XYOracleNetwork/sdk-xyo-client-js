import { IdPayload } from './Payload'
import { IdSchema } from './Schema'

export const idPayloadTemplate = (): IdPayload => ({
  salt: '',
  schema: IdSchema,
})
