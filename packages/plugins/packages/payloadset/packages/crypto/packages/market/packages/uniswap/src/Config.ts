import { XyoUniswapCryptoMarketWitnessConfigSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness'

export type XyoUniswapCryptoMarketWitnessConfig = WitnessConfig<{
  pools?: string[]
  schema: XyoUniswapCryptoMarketWitnessConfigSchema
}>
