import { QueryPayload } from './Payload.js'
import { QuerySchema } from './Schema.js'

export const queryPayloadTemplate = (): QueryPayload => ({
  query: '',
  schema: QuerySchema,
})
