import { XyoDivinerConfig } from '@xyo-network/diviner'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoMarketAssetDiviner } from './Diviner'
import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetDivinerConfigSchema, XyoCryptoMarketAssetSchema } from './Schema'
import { XyoCryptoMarketAssetPayloadTemplate } from './Template'

export const XyoCryptoMarketAssetPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCryptoMarketAssetPayload>({
    auto: true,
    diviner: async (config) => {
      const diviner = await XyoCryptoMarketAssetDiviner.create({
        config: {
          ...config,
          schema: XyoCryptoMarketAssetDivinerConfigSchema,
          targetSchema: XyoCryptoMarketAssetSchema,
        } as XyoDivinerConfig,
      })
      return diviner
    },
    schema: XyoCryptoMarketAssetSchema,
    template: XyoCryptoMarketAssetPayloadTemplate,
  })
