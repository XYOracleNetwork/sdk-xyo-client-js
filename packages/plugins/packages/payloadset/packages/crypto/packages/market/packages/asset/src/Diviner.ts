import { AbstractDirectDiviner } from '@xyo-network/abstract-diviner'
import { CoingeckoCryptoMarketPayload, CoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { CryptoMarketAssetPayload, CryptoMarketAssetSchema } from '@xyo-network/crypto-asset-payload-plugin'
import { DivinerConfig, DivinerModule, DivinerParams } from '@xyo-network/diviner'
import { AnyConfigSchema, Module } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { UniswapCryptoMarketPayload, UniswapCryptoMarketSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { divinePrices } from './lib'
import { CryptoMarketAssetDivinerConfigSchema } from './Schema'

export type CryptoMarketAssetDivinerConfig = DivinerConfig<{ schema: CryptoMarketAssetDivinerConfigSchema }>
export type CryptoMarketAssetDivinerParams = DivinerParams<AnyConfigSchema<CryptoMarketAssetDivinerConfig>>

export class CryptoMarketAssetDiviner<TParams extends CryptoMarketAssetDivinerParams = CryptoMarketAssetDivinerParams>
  extends AbstractDirectDiviner<TParams>
  implements DivinerModule, Module
{
  static override configSchemas = [CryptoMarketAssetDivinerConfigSchema]
  static override targetSchema = CryptoMarketAssetSchema

  protected override divineHandler(payloads?: Payload[]): Promisable<Payload[]> {
    const coinGeckoPayload = payloads?.find((payload) => payload?.schema === CoingeckoCryptoMarketSchema) as CoingeckoCryptoMarketPayload
    const uniswapPayload = payloads?.find((payload) => payload?.schema === UniswapCryptoMarketSchema) as UniswapCryptoMarketPayload
    const result: CryptoMarketAssetPayload = divinePrices(coinGeckoPayload, uniswapPayload)
    return [result]
  }
}
