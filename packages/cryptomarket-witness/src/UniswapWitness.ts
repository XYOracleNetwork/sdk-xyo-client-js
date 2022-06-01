import { XyoCryptoMarketPayload } from './Payload'
import { pricesFromUniswap3 } from './Sources'
import { XyoCryptoMarketWitness } from './Witness'
import { XyoCryptoAsset } from './XyoCryptoAsset'

export class XyoUniswapCryptoMarketWitness extends XyoCryptoMarketWitness {
  constructor(coins: XyoCryptoAsset[], currencies: XyoCryptoAsset[]) {
    super(coins, currencies)
  }

  override async observe(): Promise<XyoCryptoMarketPayload> {
    const assets = await pricesFromUniswap3()

    return await super.observe({
      assets,
      source: 'uniswap3',
    })
  }

  public static schema = XyoCryptoMarketWitness.schema
}
