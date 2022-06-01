import { XyoWitness } from '@xyo-network/core'

import { XyoCryptoMarketPayload } from './Payload'
import { defaultCoins, defaultCurrencies } from './Sources'
import { XyoCryptoAsset } from './XyoCryptoAsset'

export class XyoCryptoMarketWitness extends XyoWitness<XyoCryptoMarketPayload> {
  protected coins: XyoCryptoAsset[]
  protected currencies: XyoCryptoAsset[]
  constructor(coins: XyoCryptoAsset[] = defaultCoins, currencies: XyoCryptoAsset[] = defaultCurrencies) {
    super({
      schema: XyoCryptoMarketWitness.schema,
    })
    this.coins = coins
    this.currencies = currencies
  }

  override async observe(fields?: Partial<XyoCryptoMarketPayload>): Promise<XyoCryptoMarketPayload> {
    return await super.observe({
      ...fields,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.crypto.market'
}
