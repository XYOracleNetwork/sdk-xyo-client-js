import { XyoWitness } from '@xyo-network/core'
import axios from 'axios'

import { AssetSymbol, PartialRecord, XyoCryptoMarketAssets, XyoCryptoMarketPayload } from './Payload'

type CoinGeckoSimplePrice = PartialRecord<AssetSymbol, number>
type CoinGeckoSimplePrices = Record<string, CoinGeckoSimplePrice>

interface Coin {
  name?: string
  symbol?: string
}

interface Currency {
  name?: string
  symbol?: AssetSymbol
}

const coinGeckoCoinToAssetMap: Record<string, AssetSymbol> = {
  bitcoin: 'btc',
  ethereum: 'eth',
  'xyo-network': 'xyo',
}

export class XyoCryptoMarketWitness extends XyoWitness<XyoCryptoMarketPayload> {
  private coins: Coin[]
  private currencies: Currency[]
  constructor(
    coins: Coin[] = [{ name: 'bitcoin' }, { name: 'ethereum' }, { name: 'xyo-network' }],
    currencies: Currency[] = [{ symbol: 'usd' }, { symbol: 'eur' }, { symbol: 'btc' }, { symbol: 'eth' }]
  ) {
    super({
      schema: XyoCryptoMarketWitness.schema,
    })
    this.coins = coins
    this.currencies = currencies
  }

  override async observe(): Promise<XyoCryptoMarketPayload> {
    const coinGeckoSimplePrices = (
      await axios.get<CoinGeckoSimplePrices>(
        `https://api.coingecko.com/api/v3/simple/price?ids=${this.coins.map(({ name }) => name).join(',')}&vs_currencies=${this.currencies.map(({ symbol }) => symbol).join(',')}`
      )
    ).data

    const assets: XyoCryptoMarketAssets = {}

    Object.entries(coinGeckoSimplePrices).forEach(([key, value]) => {
      assets[coinGeckoCoinToAssetMap[key]] = value
    })

    return await super.observe({
      assets,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.crypto.market'
}
