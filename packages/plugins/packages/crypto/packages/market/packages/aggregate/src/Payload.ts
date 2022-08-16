import { PartialRecord } from '@xylabs/sdk-js'
import { XyoPayload } from '@xyo-network/payload'

import { AssetInfo, Token } from './MyModels'
import { XyoCryptoMarketAssetPayloadSchema } from './Schema'

export interface XyoCryptoMarketAssetPayload extends XyoPayload {
  assets: PartialRecord<Token, AssetInfo | undefined>
  schema: XyoCryptoMarketAssetPayloadSchema
  timestamp: number
}
