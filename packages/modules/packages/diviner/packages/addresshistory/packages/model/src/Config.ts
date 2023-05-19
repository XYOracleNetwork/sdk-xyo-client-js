import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleFilter } from '@xyo-network/module-model'

import { AddressHistorySchema } from './Diviner'

export type AddressHistoryDivinerConfigSchema = `${AddressHistorySchema}.config`
export const AddressHistoryDivinerConfigSchema: AddressHistoryDivinerConfigSchema = `${AddressHistorySchema}.config`

export type AddressHistoryDivinerConfig = DivinerConfig<{
  address?: string
  archivist?: ModuleFilter
  schema: AddressHistoryDivinerConfigSchema
}>
