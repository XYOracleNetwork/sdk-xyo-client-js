import { XyoWitness } from '@xyo-network/core'

import { defaultCoins, defaultCurrencies } from './defaults'
import { XyoCryptoMarketPayload } from './Payload'
import { pricesFromCoinGecko } from './pricesFromCoinGecko'
import { XyoCryptoAsset } from './XyoCryptoAsset'

export class XyoCryptoMarketWitness extends XyoWitness<XyoCryptoMarketPayload> {
  private coins: XyoCryptoAsset[]
  private currencies: XyoCryptoAsset[]
  constructor(coins: XyoCryptoAsset[] = defaultCoins, currencies: XyoCryptoAsset[] = defaultCurrencies) {
    super({
      schema: XyoCryptoMarketWitness.schema,
    })
    this.coins = coins
    this.currencies = currencies
  }

  override async observe(): Promise<XyoCryptoMarketPayload> {
    const assets = await pricesFromCoinGecko(this.coins, this.currencies)

    return await super.observe({
      assets,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.crypto.market'
}
