import { axios } from '@xylabs/axios'
import { AssetSymbol, CryptoAsset, CryptoAssetPrices } from '@xyo-network/coingecko-crypto-market-payload-plugin'

import { coingeckoCoinToAssetMap } from './coinGeckoCoinToAssetMap'

type CoinGeckoSimplePrice = Partial<Record<AssetSymbol, number>>
type CoinGeckoSimplePrices = Record<string, CoinGeckoSimplePrice>

export const pricesFromCoingecko = async (coins: CryptoAsset[], currencies: CryptoAsset[]) => {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coins.map(({ name }) => name).join(',')}&vs_currencies=${currencies
    .map(({ symbol }) => symbol)
    .join(',')}`
  const coinGeckoSimplePrices = (await axios.get<CoinGeckoSimplePrices>(url)).data
  const assets: CryptoAssetPrices = {}
  Object.entries(coinGeckoSimplePrices).forEach(([key, value]) => {
    assets[coingeckoCoinToAssetMap[key]] = value
  })
  return assets
}
