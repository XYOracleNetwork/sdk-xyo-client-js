export * from '@xyo-network/coingecko-crypto-market-payload-plugin'
export * from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { XyoCoingeckoCryptoMarketPayloadPlugin } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoUniswapCryptoMarketPayloadPlugin } from '@xyo-network/uniswap-crypto-market-payload-plugin'

// eslint-disable-next-line import/no-default-export
export default [XyoCryptoCardsGamePayloadPlugin, XyoCryptoCardsMovePayloadPlugin]
