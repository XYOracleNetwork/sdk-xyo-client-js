import { XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { AbstractDiviner, DivinerConfig, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'
import { XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { divinePrices } from './lib'
import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetDivinerConfigSchema, XyoCryptoMarketAssetSchema } from './Schema'

export class XyoCryptoMarketAssetDiviner extends AbstractDiviner {
  static override configSchema = XyoCryptoMarketAssetDivinerConfigSchema
  static override targetSchema = XyoCryptoMarketAssetSchema

  static override async create(params?: XyoModuleParams<DivinerConfig>) {
    return (await super.create(params)) as XyoCryptoMarketAssetDiviner
  }

  public override divine(payloads?: XyoPayloads): Promisable<XyoPayloads> {
    const coinGeckoPayload = payloads?.find((payload) => payload?.schema === XyoCoingeckoCryptoMarketSchema) as XyoCoingeckoCryptoMarketPayload
    const uniswapPayload = payloads?.find((payload) => payload?.schema === XyoUniswapCryptoMarketSchema) as XyoUniswapCryptoMarketPayload
    const result: XyoCryptoMarketAssetPayload = divinePrices(coinGeckoPayload, uniswapPayload)
    return [result]
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }
}
