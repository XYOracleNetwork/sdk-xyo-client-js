import { CryptoMarketAssetSchema } from '@xyo-network/crypto-asset-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetDivinerPlugin } from '@xyo-network/payloadset-plugin'

import { CryptoMarketAssetDiviner } from './Diviner'

export const CryptoMarketAssetPlugin = () =>
  createPayloadSetDivinerPlugin<CryptoMarketAssetDiviner>(
    { required: { [CryptoMarketAssetSchema]: 1 }, schema: PayloadSetSchema },
    {
      diviner: async (params) => {
        return (await CryptoMarketAssetDiviner.create(params)) as CryptoMarketAssetDiviner
      },
    },
  )
