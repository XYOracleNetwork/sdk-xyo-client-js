import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoMarketAssetDiviner } from './Diviner'
import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetDivinerConfigSchema, XyoCryptoMarketAssetPayloadSchema } from './Schema'
import { XyoCryptoMarketAssetPayloadTemplate } from './Template'

export const XyoCryptoMarketAssetPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCryptoMarketAssetPayload>({
    auto: true,
    diviner: (config) => {
      return new XyoCryptoMarketAssetDiviner({
        ...config,
        schema: XyoCryptoMarketAssetDivinerConfigSchema,
        targetSchema: XyoCryptoMarketAssetPayloadSchema,
      })
    },
    schema: XyoCryptoMarketAssetPayloadSchema,
    template: XyoCryptoMarketAssetPayloadTemplate,
  })
