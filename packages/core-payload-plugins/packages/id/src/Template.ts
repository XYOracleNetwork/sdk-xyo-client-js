import { IdPayload } from './Payload.js'
import { IdSchema } from './Schema.js'

export const idPayloadTemplate = (): IdPayload => ({
  salt: '',
  schema: IdSchema,
})
