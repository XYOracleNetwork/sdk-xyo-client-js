import { AddressTransactionHistoryWitnessConfigSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness'

export type AddressTransactionHistoryWitnessConfig = WitnessConfig<{
  address?: string
  chainId?: number
  schema: AddressTransactionHistoryWitnessConfigSchema
}>
