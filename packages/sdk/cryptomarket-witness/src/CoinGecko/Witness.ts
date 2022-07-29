import { XyoQueryWitness } from '@xyo-network/witness'

import { XyoCryptoMarketCoinGeckoPayload, XyoCryptoMarketCoinGeckoQueryPayload } from './Payload'
import { pricesFromCoinGecko } from './pricesFromCoinGecko'

export class XyoCoinGeckoCryptoMarketWitness extends XyoQueryWitness<XyoCryptoMarketCoinGeckoPayload, XyoCryptoMarketCoinGeckoQueryPayload> {
  override async observe(): Promise<XyoCryptoMarketCoinGeckoPayload> {
    const assets = await pricesFromCoinGecko(this.config?.query.coins ?? [], this.config?.query.currencies ?? [])

    return await super.observe({
      assets,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.crypto.market.coingecko'
}
