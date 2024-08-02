import { IdPayload } from './Payload.ts'
import { IdSchema } from './Schema.ts'

export const idPayloadTemplate = (): IdPayload => ({
  salt: '',
  schema: IdSchema,
})
