import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGameSchema } from './Schema'

export const cryptoCardsGamePayloadTemplate = (): Partial<XyoCryptoCardsGamePayload> => ({
  schema: XyoCryptoCardsGameSchema,
})
