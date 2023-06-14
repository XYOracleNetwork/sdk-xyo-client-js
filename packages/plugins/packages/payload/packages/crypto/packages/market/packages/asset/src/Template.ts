import { CryptoMarketAssetPayload } from './Payload'
import { CryptoMarketAssetSchema } from './Schema'

export const cryptoMarketAssetPayloadTemplate = (): Partial<CryptoMarketAssetPayload> => ({
  schema: CryptoMarketAssetSchema,
})
