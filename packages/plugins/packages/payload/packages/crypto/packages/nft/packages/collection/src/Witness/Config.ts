import { WitnessConfig } from '@xyo-network/witness'

import { NftCollectionWitnessConfigSchema } from './Schema'

export type CryptoWalletNftCollectionWitnessConfig = WitnessConfig<{
  address?: string
  chainId?: number
  schema: NftCollectionWitnessConfigSchema
}>
