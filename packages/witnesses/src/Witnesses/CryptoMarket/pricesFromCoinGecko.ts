import axios from 'axios'

import { AssetSymbol } from './AssetSymbol'
import { coinGeckoCoinToAssetMap } from './coinGeckoCoinToAssetMap'
import { PartialRecord } from './PartialRecord'
import { XyoCryptoAsset } from './XyoCryptoAsset'
import { XyoCryptoAssets } from './XyoCryptoAssets'

type CoinGeckoSimplePrice = PartialRecord<AssetSymbol, number>
type CoinGeckoSimplePrices = Record<string, CoinGeckoSimplePrice>

export const pricesFromCoinGecko = async (coins: XyoCryptoAsset[], currencies: XyoCryptoAsset[]) => {
  const coinGeckoSimplePrices = (
    await axios.get<CoinGeckoSimplePrices>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coins.map(({ name }) => name).join(',')}&vs_currencies=${currencies.map(({ symbol }) => symbol).join(',')}`
    )
  ).data

  const assets: XyoCryptoAssets = {}

  Object.entries(coinGeckoSimplePrices).forEach(([key, value]) => {
    assets[coinGeckoCoinToAssetMap[key]] = value
  })
  return assets
}
