import { Payload } from '@xyo-network/payload-model'

import { NftWitnessQuerySchema } from './Schema'

export type NftWitnessQueryPayload = Payload<{
  address?: string
  chainId?: number
  /**
   * The maximum number of NFTs to return. Configurable to prevent
   * large wallets from exhausting Infura API credits.
   */
  maxNfts?: number
  schema: NftWitnessQuerySchema
}>
export const isNftWitnessQueryPayload = (x?: Payload | null): x is NftWitnessQueryPayload => x?.schema === NftWitnessQuerySchema
