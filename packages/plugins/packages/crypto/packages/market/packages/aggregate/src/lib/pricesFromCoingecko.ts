import { PartialRecord } from '@xylabs/sdk-js'
import axios from 'axios'

import { AssetSymbol } from './AssetSymbol'
import { coingeckoCoinToAssetMap } from './coinGeckoCoinToAssetMap'
import { XyoCryptoAsset } from './XyoCryptoAsset'
import { XyoCryptoAssetPrices } from './XyoCryptoAssets'

type CoinGeckoSimplePrice = PartialRecord<AssetSymbol, number>
type CoinGeckoSimplePrices = Record<string, CoinGeckoSimplePrice>

export const pricesFromCoingecko = async (coins: XyoCryptoAsset[], currencies: XyoCryptoAsset[]) => {
  const coinGeckoSimplePrices = (
    await axios.get<CoinGeckoSimplePrices>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coins.map(({ name }) => name).join(',')}&vs_currencies=${currencies
        .map(({ symbol }) => symbol)
        .join(',')}`,
    )
  ).data

  const assets: XyoCryptoAssetPrices = {}

  Object.entries(coinGeckoSimplePrices).forEach(([key, value]) => {
    assets[coingeckoCoinToAssetMap[key]] = value
  })
  return assets
}
