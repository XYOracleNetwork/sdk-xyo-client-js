export * from '@xyo-network/coingecko-crypto-market-payload-plugin'
export * from '@xyo-network/crypto-asset-payload-plugin'
export * from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { XyoCoingeckoCryptoMarketPlugin } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoCryptoMarketAssetPlugin } from '@xyo-network/crypto-asset-payload-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'
import { XyoUniswapCryptoMarketPlugin } from '@xyo-network/uniswap-crypto-market-payload-plugin'

export const XyoCryptoMarketPlugins: PayloadSetPluginFunc[] = [
  XyoCoingeckoCryptoMarketPlugin,
  XyoUniswapCryptoMarketPlugin,
  XyoCryptoMarketAssetPlugin,
]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoMarketPlugins
