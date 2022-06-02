import { Provider } from '@ethersproject/providers'
import { XyoQueryWitness } from '@xyo-network/core'

import { XyoCryptoMarketUniswapPayload, XyoCryptoMarketUniswapQueryPayload } from './Payload'
import { pricesFromUniswap3 } from './pricesFromUniswap3'

export class XyoUniswapCryptoMarketWitness extends XyoQueryWitness<XyoCryptoMarketUniswapQueryPayload, XyoCryptoMarketUniswapPayload> {
  protected provider: Provider
  constructor(query: XyoCryptoMarketUniswapQueryPayload, provider: Provider) {
    super({
      targetSchema: XyoUniswapCryptoMarketWitness.schema,
      ...query,
    })
    this.provider = provider
  }

  override async observe(): Promise<XyoCryptoMarketUniswapPayload> {
    const pairs = await pricesFromUniswap3(this.provider, this.query.pools)

    return await super.observe({
      pairs,
    })
  }

  public static schema = 'network.xyo.crypto.market.uniswap'
}
