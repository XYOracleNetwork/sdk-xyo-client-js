import { CryptoWalletNftWitnessConfigSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness'

export type CryptoWalletNftWitnessConfig = WitnessConfig<{
  address?: string
  chainId?: number
  schema: CryptoWalletNftWitnessConfigSchema
}>
