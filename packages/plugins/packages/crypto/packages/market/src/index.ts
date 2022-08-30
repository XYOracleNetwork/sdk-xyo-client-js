export * from '@xyo-network/coingecko-crypto-market-payload-plugin'
export * from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { XyoCoingeckoCryptoMarketPayloadPlugin } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoUniswapCryptoMarketPayloadPlugin } from '@xyo-network/uniswap-crypto-market-payload-plugin'

export const XyoCryptoMarketPayloadPlugins: XyoPayloadPluginFunc[] = [XyoCoingeckoCryptoMarketPayloadPlugin, XyoUniswapCryptoMarketPayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoMarketPayloadPlugins
