import { XyoIdPayload } from './Payload'
import { XyoIdSchema } from './Schema'

export const XyoIdPayloadTemplate = (): XyoIdPayload => ({
  salt: '',
  schema: XyoIdSchema,
})
