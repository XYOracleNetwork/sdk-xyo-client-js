import { XyoWitness } from '@xyo-network/core'
import axios from 'axios'

import { XyoCryptoMarketPayload } from './Payload'

interface CoinGeckoSimplePrice {
  usd?: number
  eur?: number
  btc?: number
  eth?: number
}

interface Coin {
  name?: string
  symbol?: string
}

interface Currency {
  name?: string
  symbol?: string
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
    const result = await axios.get<CoinGeckoSimplePrice[]>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${this.coins.map(({ name }) => name).join(',')}&vs_currencies=${this.currencies.map(({ symbol }) => symbol).join(',')}`
    )
    return await super.observe({ assets: result.data, timestamp: Date.now() })
  }

  public static schema = 'network.xyo.crypto.market'
}
