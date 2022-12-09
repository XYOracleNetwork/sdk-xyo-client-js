export * from '@xyo-network/coingecko-crypto-market-plugin'
export * from '@xyo-network/crypto-asset-plugin'
export * from '@xyo-network/uniswap-crypto-market-plugin'

import { XyoCoingeckoCryptoMarketPlugin } from '@xyo-network/coingecko-crypto-market-plugin'
import { XyoCryptoMarketAssetPlugin } from '@xyo-network/crypto-asset-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'
import { XyoUniswapCryptoMarketPlugin } from '@xyo-network/uniswap-crypto-market-plugin'

export const XyoCryptoMarketPlugins: PayloadSetPluginFunc[] = [
  XyoCoingeckoCryptoMarketPlugin,
  XyoUniswapCryptoMarketPlugin,
  XyoCryptoMarketAssetPlugin,
]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoMarketPlugins
