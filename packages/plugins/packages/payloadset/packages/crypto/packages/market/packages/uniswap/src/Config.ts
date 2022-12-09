import { XyoUniswapCryptoMarketWitnessConfigSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'
import { XyoWitnessConfig } from '@xyo-network/witness'

export type XyoUniswapCryptoMarketWitnessConfig = XyoWitnessConfig<{
  pools: string[]
  schema: XyoUniswapCryptoMarketWitnessConfigSchema
}>
