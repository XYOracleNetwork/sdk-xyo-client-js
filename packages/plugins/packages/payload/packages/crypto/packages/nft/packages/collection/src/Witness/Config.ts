import { WitnessConfig } from '@xyo-network/witness-model'

import { NftCollectionWitnessConfigSchema } from './Schema'

export type NftCollectionWitnessConfig = WitnessConfig<{
  address?: string
  chainId?: number
  schema: NftCollectionWitnessConfigSchema
}>
