import { Address, Hash } from '@xylabs/hex'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { AddressChainDivinerConfigSchema } from './Schema.js'

export type AddressChainDivinerConfig = DivinerConfig<{
  address?: Address
  maxResults?: number
  schema: AddressChainDivinerConfigSchema
  startHash?: Hash
}>
