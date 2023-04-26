import { DivinerConfig } from '@xyo-network/diviner-model'

import { AddressChainDivinerConfigSchema } from './Schema'

export type AddressChainDivinerConfig = DivinerConfig<{
  address?: string
  maxResults?: number
  schema: AddressChainDivinerConfigSchema
  startHash?: string
}>
