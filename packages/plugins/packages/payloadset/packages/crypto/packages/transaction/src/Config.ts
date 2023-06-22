import { AddressTransactionHistoryWitnessConfigSchema } from '@xyo-network/crypto-address-transaction-history-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness'

export type AddressTransactionHistoryWitnessConfig = WitnessConfig<{
  address?: string
  schema: AddressTransactionHistoryWitnessConfigSchema
}>
