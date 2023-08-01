import { NftSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetDivinerPlugin } from '@xyo-network/payloadset-plugin'

import { NftScoreDiviner } from './Diviner'

export const NftScoreDivinerPlugin = () =>
  createPayloadSetDivinerPlugin<NftScoreDiviner>(
    { required: { [NftSchema]: 1 }, schema: PayloadSetSchema },
    {
      diviner: async (params) => {
        const result = await NftScoreDiviner.create(params)
        return result
      },
    },
  )
