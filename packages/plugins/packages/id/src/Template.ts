import { XyoIdPayload } from './Payload'
import { XyoIdPayloadSchema } from './Schema'

export const XyoIdPayloadTemplate = (): XyoIdPayload => ({
  salt: '',
  schema: XyoIdPayloadSchema,
})
