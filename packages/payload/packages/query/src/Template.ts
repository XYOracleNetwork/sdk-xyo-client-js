import { QueryPayload } from './Payload'
import { QuerySchema } from './Schema'

export const queryPayloadTemplate = (): QueryPayload => ({
  query: '',
  schema: QuerySchema,
})
