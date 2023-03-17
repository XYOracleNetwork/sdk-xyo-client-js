import { Payload } from '@xyo-network/payload-model'

import { AssetInfo, Token } from './Model'
import { XyoCryptoMarketAssetSchema } from './Schema'

export interface XyoCryptoMarketAssetPayload extends Payload {
  assets: Partial<Record<Token, AssetInfo | undefined>>
  schema: XyoCryptoMarketAssetSchema
  timestamp: number
}
