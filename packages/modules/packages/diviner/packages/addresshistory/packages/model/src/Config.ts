import { Address } from '@xylabs/hex'
import { DivinerConfig } from '@xyo-network/diviner-model'

import { AddressHistorySchema } from './Diviner.js'

export type AddressHistoryDivinerConfigSchema = `${AddressHistorySchema}.config`
export const AddressHistoryDivinerConfigSchema: AddressHistoryDivinerConfigSchema = `${AddressHistorySchema}.config`

export type AddressHistoryDivinerConfig = DivinerConfig<{
  address?: Address
  schema: AddressHistoryDivinerConfigSchema
}>
