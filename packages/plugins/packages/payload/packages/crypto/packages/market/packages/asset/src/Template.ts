import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetSchema } from './Schema'

export const cryptoMarketAssetPayloadTemplate = (): Partial<XyoCryptoMarketAssetPayload> => ({
  schema: XyoCryptoMarketAssetSchema,
})
