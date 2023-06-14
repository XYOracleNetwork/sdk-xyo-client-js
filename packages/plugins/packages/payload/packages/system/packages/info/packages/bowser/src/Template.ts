import { BowserSystemInfoPayload } from './Payload'
import { BowserSystemInfoSchema } from './Schema'

export const bowserSystemInfoPayloadTemplate = (): BowserSystemInfoPayload => ({
  schema: BowserSystemInfoSchema,
})
