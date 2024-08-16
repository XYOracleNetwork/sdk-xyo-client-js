import type { QueryPayload } from './Payload.ts'
import { QuerySchema } from './Schema.ts'

export const queryPayloadTemplate = (): QueryPayload => ({
  query: '',
  schema: QuerySchema,
})
