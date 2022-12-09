import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketSchema } from './Schema'

export const coingeckoCryptoMarketPayloadTemplate = (): Partial<XyoCoingeckoCryptoMarketPayload> => ({
  schema: XyoCoingeckoCryptoMarketSchema,
})
