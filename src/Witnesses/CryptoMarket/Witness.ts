import axios from 'axios'

import { XyoWitness } from '../../core'
import { XyoCryptoMarketPayload } from './Payload'

interface CoinGeckoSimplePrice {
  usd: number
}

interface Coin {
  name?: string
  symbol?: string
}

export class XyoCryptoMarketWitness extends XyoWitness<XyoCryptoMarketPayload> {
  private coins: Coin[]
  constructor(coins: Coin[] = [{ name: 'bitcoin' }, { name: 'ethereum' }, { name: 'xyo-network' }]) {
    super({
      schema: XyoCryptoMarketWitness.schema,
    })
    this.coins = coins
  }

  override async observe(): Promise<XyoCryptoMarketPayload> {
    const result = await axios.get<CoinGeckoSimplePrice[]>(`https://api.coingecko.com/api/v3/simple/price?ids=${this.coins.join('&')}&vs_currencies=usd`)
    return await super.observe({ assets: result.data, timestamp: Date.now() })
  }

  public static schema = 'network.xyo.crypto.market'
}
