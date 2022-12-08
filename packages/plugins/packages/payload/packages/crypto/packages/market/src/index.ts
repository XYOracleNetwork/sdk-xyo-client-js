export * from '@xyo-network/coingecko-crypto-market-payload-plugin'
export * from '@xyo-network/crypto-asset-payload-plugin'
export * from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { CoingeckoCryptoMarketPayloadPlugin } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { CryptoMarketAssetPayloadPlugin } from '@xyo-network/crypto-asset-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { UniswapCryptoMarketPayloadPlugin } from '@xyo-network/uniswap-crypto-market-payload-plugin'

export const XyoCryptoMarketPlugins: XyoPayloadPluginFunc[] = [
  CoingeckoCryptoMarketPayloadPlugin,
  UniswapCryptoMarketPayloadPlugin,
  CryptoMarketAssetPayloadPlugin,
]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoMarketPlugins
