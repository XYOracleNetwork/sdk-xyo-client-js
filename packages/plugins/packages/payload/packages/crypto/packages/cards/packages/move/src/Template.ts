import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMoveSchema } from './Schema'

export const cryptoCardsMovePayloadTemplate = (): Partial<XyoCryptoCardsMovePayload> => ({
  schema: XyoCryptoCardsMoveSchema,
})
