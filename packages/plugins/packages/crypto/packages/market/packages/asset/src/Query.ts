import { XyoCoingeckoCryptoMarketPayload } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoQueryPayload } from '@xyo-network/payload'
import { XyoUniswapCryptoMarketPayload } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { XyoCryptoMarketAssetDivinerQueryPayloadSchema } from './Schema'

export type XyoCryptoMarketAssetQueryPayload = XyoQueryPayload<{
  schema: XyoCryptoMarketAssetDivinerQueryPayloadSchema
  payloads: {
    coinGeckoPayload: XyoCoingeckoCryptoMarketPayload | undefined
    uniswapPayload: XyoUniswapCryptoMarketPayload | undefined
  }
}>
