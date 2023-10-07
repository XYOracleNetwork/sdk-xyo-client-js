import { WitnessConfig } from '@xyo-network/witness-model'

import { NftWitnessConfigSchema } from './Schema'

export type CryptoWalletNftWitnessConfig = WitnessConfig<{
  address?: string
  chainId?: number
  schema: NftWitnessConfigSchema
}>
