import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoPayloadSchema } from './Schema'

export const XyoBowserSystemInfoPayloadTemplate = (): XyoBowserSystemInfoPayload => ({
  schema: XyoBowserSystemInfoPayloadSchema,
})
