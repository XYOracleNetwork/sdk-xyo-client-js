import { XyoCoingeckoCryptoMarketPayload } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoQueryPayload } from '@xyo-network/payload'
import { XyoUniswapCryptoMarketPayload } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { XyoCryptoMarketAssetQueryPayloadSchema } from './Schema'

export type XyoCryptoMarketAssetQueryPayload = XyoQueryPayload<{
  schema: XyoCryptoMarketAssetQueryPayloadSchema
  payloads: {
    coinGeckoPayload: XyoCoingeckoCryptoMarketPayload | undefined
    uniswapPayload: XyoUniswapCryptoMarketPayload | undefined
  }
}>
