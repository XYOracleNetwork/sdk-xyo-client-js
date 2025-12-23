import type { Address, Hash } from '@xylabs/sdk-js'
import type { DivinerConfig } from '@xyo-network/diviner-model'

import type { AddressChainDivinerConfigSchema } from './Schema.ts'

export type AddressChainDivinerConfig = DivinerConfig<{
  address?: Address
  maxResults?: number
  schema: AddressChainDivinerConfigSchema
  startHash?: Hash
}>
