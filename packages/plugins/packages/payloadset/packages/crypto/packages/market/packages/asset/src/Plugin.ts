import { XyoCryptoMarketAssetSchema } from '@xyo-network/crypto-asset-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetDivinerPlugin, PayloadSetDivinerPlugin } from '@xyo-network/payloadset-plugin'

import { XyoCryptoMarketAssetDiviner } from './Diviner'

export const XyoCryptoMarketAssetPlugin = () =>
  createPayloadSetDivinerPlugin<PayloadSetDivinerPlugin<XyoCryptoMarketAssetDiviner>>(
    { required: { [XyoCryptoMarketAssetSchema]: 1 }, schema: PayloadSetSchema },
    {
      diviner: async (params) => {
        return await XyoCryptoMarketAssetDiviner.create(params)
      },
    },
  )
