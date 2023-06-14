import { Payload } from '@xyo-network/payload-model'

import { AssetInfo, Token } from './Model'
import { CryptoMarketAssetSchema } from './Schema'

export interface CryptoMarketAssetPayload extends Payload {
  assets: Partial<Record<Token, AssetInfo | undefined>>
  schema: CryptoMarketAssetSchema
  timestamp: number
}
