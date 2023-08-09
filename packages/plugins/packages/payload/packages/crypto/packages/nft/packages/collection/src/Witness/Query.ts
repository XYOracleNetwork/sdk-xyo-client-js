import { Payload } from '@xyo-network/payload-model'

import { NftCollectionWitnessQuerySchema } from './Schema'

export type NftCollectionWitnessQuery = Payload<
  {
    address?: string
    chainId?: number
    /**
     * The maximum number of NFTs to sample from the collection
     * for determining the collection's schema & distribution
     */
    maxNfts?: number
  },
  NftCollectionWitnessQuerySchema
>
export const isNftCollectionWitnessQuery = (x?: Payload | null): x is NftCollectionWitnessQuery => x?.schema === NftCollectionWitnessQuerySchema
