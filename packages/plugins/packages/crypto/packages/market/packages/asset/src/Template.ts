import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetPayloadSchema } from './Schema'

export const XyoCryptoMarketAssetPayloadTemplate = (): Partial<XyoCryptoMarketAssetPayload> => ({
  schema: XyoCryptoMarketAssetPayloadSchema,
})
