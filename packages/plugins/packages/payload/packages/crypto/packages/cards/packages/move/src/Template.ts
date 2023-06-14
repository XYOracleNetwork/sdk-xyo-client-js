import { CryptoCardsMovePayload } from './Payload'
import { CryptoCardsMoveSchema } from './Schema'

export const cryptoCardsMovePayloadTemplate = (): Partial<CryptoCardsMovePayload> => ({
  schema: CryptoCardsMoveSchema,
})
