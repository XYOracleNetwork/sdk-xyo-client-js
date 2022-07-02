import { Provider } from '@ethersproject/providers'
import { XyoQueryWitness } from '@xyo-network/witnesses'

import { XyoCryptoMarketUniswapPayload, XyoCryptoMarketUniswapQueryPayload } from './Payload'
import { createUniswapPoolContracts, pricesFromUniswap3, UniSwap3Pair, UniswapPoolContracts } from './pricesFromUniswap3'

export class XyoUniswapCryptoMarketWitness extends XyoQueryWitness<XyoCryptoMarketUniswapQueryPayload, XyoCryptoMarketUniswapPayload> {
  protected provider: Provider
  protected pairs: UniSwap3Pair[]
  constructor(query: XyoCryptoMarketUniswapQueryPayload, provider: Provider) {
    super({
      targetSchema: XyoUniswapCryptoMarketWitness.schema,
      ...query,
    })
    this.provider = provider
    this.pairs = createUniswapPoolContracts(provider, query.pools ?? UniswapPoolContracts)
  }

  override async observe(): Promise<XyoCryptoMarketUniswapPayload> {
    const pairs = await pricesFromUniswap3(this.pairs)
    const timestamp = Date.now()

    return await super.observe({
      pairs,
      timestamp,
    })
  }

  public static schema = 'network.xyo.crypto.market.uniswap'
}
