import { XyoDiviner } from '@xyo-network/diviner'
import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetPayloadSchema } from './Schema'
import { XyoCryptoMarketAssetPayloadTemplate } from './Template'

export const XyoCryptoMarketAssetPayloadPlugin: XyoPayloadPluginFunc<XyoCryptoMarketAssetPayloadSchema, XyoCryptoMarketAssetPayload> = (_config?) =>
  createXyoPayloadPlugin({
    auto: true,
    diviner: (): XyoDiviner => {
      throw new Error('Not Implemented')
    },
    schema: XyoCryptoMarketAssetPayloadSchema,
    template: XyoCryptoMarketAssetPayloadTemplate,
  })
