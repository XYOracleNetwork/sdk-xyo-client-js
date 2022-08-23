import { XyoDiviner } from '@xyo-network/diviner'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetPayloadSchema } from './Schema'
import { XyoCryptoMarketAssetPayloadTemplate } from './Template'

export const XyoCryptoMarketAssetPayloadPlugin: XyoPayloadPluginFunc<XyoCryptoMarketAssetPayloadSchema, XyoCryptoMarketAssetPayload> = (
  _config?,
): XyoPayloadPlugin<XyoCryptoMarketAssetPayload> =>
  createXyoPayloadPlugin({
    auto: true,
    diviner: (): XyoDiviner => {
      throw new Error('Not Implemented')
    },
    schema: XyoCryptoMarketAssetPayloadSchema,
    template: XyoCryptoMarketAssetPayloadTemplate,
  })
