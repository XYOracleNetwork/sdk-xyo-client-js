import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoSchema } from './Schema'

export const bowserSystemInfoPayloadTemplate = (): XyoBowserSystemInfoPayload => ({
  schema: XyoBowserSystemInfoSchema,
})
