import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetSchema } from './Schema'
import { cryptoMarketAssetPayloadTemplate } from './Template'

export const CryptoMarketAssetPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCryptoMarketAssetPayload>({
    schema: XyoCryptoMarketAssetSchema,
    template: cryptoMarketAssetPayloadTemplate,
  })
