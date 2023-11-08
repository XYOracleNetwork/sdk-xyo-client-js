import { Payload } from '@xyo-network/payload-model'

import { NftWitnessQuerySchema } from './Schema'

export type NftWitnessQuery = Payload<
  {
    address?: string
    /**
     * The maximum number of NFTs to return. Configurable to prevent
     * large wallets from exhausting Infura API credits.
     */
    maxNfts?: number
  },
  NftWitnessQuerySchema
>
export const isNftWitnessQuery = (x?: Payload | null): x is NftWitnessQuery => x?.schema === NftWitnessQuerySchema
