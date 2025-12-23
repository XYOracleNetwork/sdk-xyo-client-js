import type { Address } from '@xylabs/sdk-js'
import type { DivinerConfig } from '@xyo-network/diviner-model'

import { AddressHistorySchema } from './Diviner.ts'

export type AddressHistoryDivinerConfigSchema = `${AddressHistorySchema}.config`
export const AddressHistoryDivinerConfigSchema: AddressHistoryDivinerConfigSchema = `${AddressHistorySchema}.config`

export type AddressHistoryDivinerConfig = DivinerConfig<{
  address?: Address
  schema: AddressHistoryDivinerConfigSchema
}>
