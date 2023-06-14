import { UniswapCryptoMarketWitnessConfigSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness'

export type UniswapCryptoMarketWitnessConfig = WitnessConfig<{
  pools?: string[]
  schema: UniswapCryptoMarketWitnessConfigSchema
}>
