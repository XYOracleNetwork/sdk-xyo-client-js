import type { Id } from './Payload.ts'
import { IdSchema } from './Schema.ts'

export const idPayloadTemplate = (): Id => ({
  salt: '',
  schema: IdSchema,
})
