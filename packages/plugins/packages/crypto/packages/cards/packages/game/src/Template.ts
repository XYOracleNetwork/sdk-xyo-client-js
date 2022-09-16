import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGameSchema } from './Schema'

export const XyoCryptoCardsGamePayloadTemplate = (): Partial<XyoCryptoCardsGamePayload> => ({
  schema: XyoCryptoCardsGameSchema,
})
