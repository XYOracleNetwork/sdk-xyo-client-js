import { DivinerConfig } from '@xyo-network/diviner-model'

import { AddressChainSchema } from './Diviner'

export type AddressChainDivinerConfigSchema = `${AddressChainSchema}.config`
export const AddressChainDivinerConfigSchema: AddressChainDivinerConfigSchema = `${AddressChainSchema}.config`

export type AddressChainDivinerConfig = DivinerConfig<{
  address?: string
  maxResults?: number
  schema: AddressChainDivinerConfigSchema
  startHash?: string
}>
