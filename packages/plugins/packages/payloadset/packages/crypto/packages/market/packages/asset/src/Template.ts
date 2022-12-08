import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetSchema } from './Schema'

export const XyoCryptoMarketAssetPayloadTemplate = (): Partial<XyoCryptoMarketAssetPayload> => ({
  schema: XyoCryptoMarketAssetSchema,
})
