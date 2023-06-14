import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { CryptoMarketAssetPayload } from './Payload'
import { CryptoMarketAssetSchema } from './Schema'
import { cryptoMarketAssetPayloadTemplate } from './Template'

export const CryptoMarketAssetPayloadPlugin = () =>
  createPayloadPlugin<CryptoMarketAssetPayload>({
    schema: CryptoMarketAssetSchema,
    template: cryptoMarketAssetPayloadTemplate,
  })
