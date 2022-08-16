import { XyoDiviner } from '@xyo-network/diviner'
import { createXyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetQueryPayload } from './Query'
import { XyoCryptoMarketAssetPayloadSchema } from './Schema'
import { XyoCryptoMarketAssetPayloadTemplate } from './Template'

export const XyoCryptoMarketAssetPayloadPlugin: XyoPayloadPluginFunc<
  XyoCryptoMarketAssetPayloadSchema,
  XyoCryptoMarketAssetPayload,
  XyoPayloadPluginConfig<XyoWitnessConfig<XyoCryptoMarketAssetQueryPayload>>
> = (_config?) =>
  createXyoPayloadPlugin({
    auto: true,
    diviner: (): XyoDiviner => {
      throw new Error('Not Implemented')
    },
    schema: XyoCryptoMarketAssetPayloadSchema,
    template: XyoCryptoMarketAssetPayloadTemplate,
  })
