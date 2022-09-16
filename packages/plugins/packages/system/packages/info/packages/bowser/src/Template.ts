import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoSchema } from './Schema'

export const XyoBowserSystemInfoPayloadTemplate = (): XyoBowserSystemInfoPayload => ({
  schema: XyoBowserSystemInfoSchema,
})
