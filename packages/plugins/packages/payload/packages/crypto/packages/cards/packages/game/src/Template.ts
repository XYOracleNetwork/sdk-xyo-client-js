import { CryptoCardsGamePayload } from './Payload'
import { CryptoCardsGameSchema } from './Schema'

export const cryptoCardsGamePayloadTemplate = (): Partial<CryptoCardsGamePayload> => ({
  schema: CryptoCardsGameSchema,
})
