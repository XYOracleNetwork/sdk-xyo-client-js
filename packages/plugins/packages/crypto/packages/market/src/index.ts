export * from '@xyo-network/coingecko-crypto-market-payload-plugin'
export * from '@xyo-network/crypto-asset-payload-plugin'
export * from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { XyoCoingeckoCryptoMarketPayloadPlugin } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoCryptoMarketAssetPayloadPlugin } from '@xyo-network/crypto-asset-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoUniswapCryptoMarketPayloadPlugin } from '@xyo-network/uniswap-crypto-market-payload-plugin'

export const XyoCryptoMarketPayloadPlugins: XyoPayloadPluginFunc[] = [
  XyoCoingeckoCryptoMarketPayloadPlugin,
  XyoUniswapCryptoMarketPayloadPlugin,
  XyoCryptoMarketAssetPayloadPlugin,
]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoMarketPayloadPlugins
