import { exists } from '@xylabs/sdk-js'
import { XyoCoingeckoCryptoMarketPayload } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoPayloadBuilder } from '@xyo-network/payload'
import { XyoUniswapCryptoMarketPayload } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { XyoCryptoMarketAssetPayload } from '../Payload'
import { XyoCryptoMarketAssetSchema } from '../Schema'
import { average } from './average'
import { divineCoinGeckoPrices } from './divineCoinGeckoPrices'
import { divineUniswapPrices } from './divineUniswapPrices'

const schema = XyoCryptoMarketAssetSchema

export const divinePrices = (
  coinGeckoPayload: XyoCoingeckoCryptoMarketPayload | undefined,
  uniswapPayload: XyoUniswapCryptoMarketPayload | undefined,
): XyoCryptoMarketAssetPayload => {
  const coinGeckoPrices = divineCoinGeckoPrices(coinGeckoPayload)
  const uniswapPrices = divineUniswapPrices(uniswapPayload)
  const prices = [uniswapPayload, coinGeckoPayload].some(exists)
  const assets = prices ? average(coinGeckoPrices, uniswapPrices) : {}
  const timestamp = Date.now()
  return new XyoPayloadBuilder<XyoCryptoMarketAssetPayload>({ schema }).fields({ assets, timestamp }).build()
}
