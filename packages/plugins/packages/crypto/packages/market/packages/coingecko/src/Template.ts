import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketPayloadSchema } from './Schema'

export const XyoCoingeckoCryptoMarketPayloadTemplate = (): Partial<XyoCoingeckoCryptoMarketPayload> => ({
  schema: XyoCoingeckoCryptoMarketPayloadSchema,
})
