import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGamePayloadSchema } from './Schema'

export const XyoCryptoCardsGamePayloadTemplate = (): Partial<XyoCryptoCardsGamePayload> => ({
  schema: XyoCryptoCardsGamePayloadSchema,
})
