import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketSchema } from './Schema'

export const XyoCoingeckoCryptoMarketPayloadTemplate = (): Partial<XyoCoingeckoCryptoMarketPayload> => ({
  schema: XyoCoingeckoCryptoMarketSchema,
})
