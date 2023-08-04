import { NftSchema } from '@xyo-network/crypto-nft-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetDivinerPlugin } from '@xyo-network/payloadset-plugin'

import { NftCollectionScoreDiviner } from './Diviner'

export const NftCollectionScoreDivinerPlugin = () =>
  createPayloadSetDivinerPlugin<NftCollectionScoreDiviner>(
    { required: { [NftSchema]: 1 }, schema: PayloadSetSchema },
    {
      diviner: async (params) => {
        const result = await NftCollectionScoreDiviner.create(params)
        return result
      },
    },
  )
