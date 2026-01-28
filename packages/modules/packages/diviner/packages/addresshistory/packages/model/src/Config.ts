import type { Address } from '@xylabs/sdk-js'
import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'

import { AddressHistorySchema } from './Diviner.ts'

export const AddressHistoryDivinerConfigSchema = asSchema(`${AddressHistorySchema}.config`, true)
export type AddressHistoryDivinerConfigSchema = typeof AddressHistoryDivinerConfigSchema

export type AddressHistoryDivinerConfig = DivinerConfig<{
  address?: Address
  schema: AddressHistoryDivinerConfigSchema
}>
