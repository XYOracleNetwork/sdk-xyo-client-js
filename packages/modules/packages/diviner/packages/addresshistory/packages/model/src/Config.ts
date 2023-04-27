import { DivinerConfig } from '@xyo-network/diviner-model'

import { AddressHistorySchema } from './Diviner'

export type AddressHistoryDivinerConfigSchema = `${AddressHistorySchema}.config`
export const AddressHistoryDivinerConfigSchema: AddressHistoryDivinerConfigSchema = `${AddressHistorySchema}.config`

export type AddressHistoryDivinerConfig = DivinerConfig<{
  address?: string
  schema: AddressHistoryDivinerConfigSchema
}>
