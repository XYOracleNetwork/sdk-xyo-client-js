import { assertEx } from '@xylabs/assert'
import { XyoDiviner, XyoDivinerConfig } from '@xyo-network/diviner'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoCryptoMarketAssetDiviner } from './Diviner'
import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetPayloadSchema } from './Schema'
import { XyoCryptoMarketAssetPayloadTemplate } from './Template'

export const XyoCryptoMarketAssetPayloadPlugin: XyoPayloadPluginFunc<
  XyoCryptoMarketAssetPayload,
  void,
  XyoDivinerConfig<XyoCryptoMarketAssetPayload>
> = (config?): XyoPayloadPlugin<XyoCryptoMarketAssetPayload> =>
  createXyoPayloadPlugin({
    auto: true,
    diviner: (): XyoDiviner<XyoCryptoMarketAssetPayload> => {
      return new XyoCryptoMarketAssetDiviner(assertEx(config?.diviner))
    },
    schema: XyoCryptoMarketAssetPayloadSchema,
    template: XyoCryptoMarketAssetPayloadTemplate,
  })
