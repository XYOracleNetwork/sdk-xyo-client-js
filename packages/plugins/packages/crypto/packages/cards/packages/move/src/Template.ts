import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMovePayloadSchema } from './Schema'

export const XyoXyoCryptoCardsMovePayloadTemplate = (): Partial<XyoCryptoCardsMovePayload> => ({
  schema: XyoCryptoCardsMovePayloadSchema,
})
