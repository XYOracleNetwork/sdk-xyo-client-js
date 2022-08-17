import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoAbstractDiviner } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { divinePrices } from './lib'
import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetQueryPayload } from './Query'

export class XyoCryptoMarketAssetDiviner extends XyoAbstractDiviner<XyoCryptoMarketAssetQueryPayload> {
  query(query: XyoCryptoMarketAssetQueryPayload): Promisable<[XyoBoundWitness, XyoPayload<XyoCryptoMarketAssetPayload>[]]> {
    const { coinGeckoPayload, uniswapPayload } = query.payloads
    const result: XyoCryptoMarketAssetPayload = divinePrices(coinGeckoPayload, uniswapPayload)
    const witnessedResult = this.bindPayloads([result])
    return [witnessedResult, [result]]
  }
}
