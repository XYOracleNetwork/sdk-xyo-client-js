import { XyoCryptoMarketPayload } from './Payload'
import { pricesFromCoinGecko } from './Sources'
import { XyoCryptoMarketWitness } from './Witness'
import { XyoCryptoAsset } from './XyoCryptoAsset'

export class XyoCoinGeckoCryptoMarketWitness extends XyoCryptoMarketWitness {
  constructor(coins: XyoCryptoAsset[], currencies: XyoCryptoAsset[]) {
    super(coins, currencies)
  }

  override async observe(): Promise<XyoCryptoMarketPayload> {
    const assets = await pricesFromCoinGecko(this.coins, this.currencies)

    return await super.observe({
      assets,
      source: 'coingecko',
    })
  }

  public static schema = XyoCryptoMarketWitness.schema
}
