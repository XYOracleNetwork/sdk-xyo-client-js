import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoMarketAssetDiviner } from './Diviner'
import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetPayloadSchema } from './Schema'
import { XyoCryptoMarketAssetPayloadTemplate } from './Template'

export const XyoCryptoMarketAssetPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCryptoMarketAssetPayload>({
    auto: true,
    diviner: (config) => {
      return new XyoCryptoMarketAssetDiviner(config)
    },
    schema: XyoCryptoMarketAssetPayloadSchema,
    template: XyoCryptoMarketAssetPayloadTemplate,
  })
