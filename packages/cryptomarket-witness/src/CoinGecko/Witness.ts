import { XyoQueryWitness } from '@xyo-network/witnesses'

import { XyoCryptoMarketCoinGeckoPayload, XyoCryptoMarketCoinGeckoQueryPayload } from './Payload'
import { pricesFromCoinGecko } from './pricesFromCoinGecko'

export class XyoCoinGeckoCryptoMarketWitness extends XyoQueryWitness<XyoCryptoMarketCoinGeckoQueryPayload, XyoCryptoMarketCoinGeckoPayload> {
  constructor(query: XyoCryptoMarketCoinGeckoQueryPayload) {
    super({
      targetSchema: XyoCoinGeckoCryptoMarketWitness.schema,
      ...query,
    })
  }

  override async observe(): Promise<XyoCryptoMarketCoinGeckoPayload> {
    const assets = await pricesFromCoinGecko(this.query.coins, this.query.currencies)

    return await super.observe({
      assets,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.crypto.market.coingecko'
}
