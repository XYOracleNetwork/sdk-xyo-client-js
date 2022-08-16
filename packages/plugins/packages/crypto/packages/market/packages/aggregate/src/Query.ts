import { XyoQueryPayload } from '@xyo-network/payload'

import { XyoCryptoMarketAssetQueryPayloadSchema } from './Schema'

export type XyoCryptoMarketAssetQueryPayload = XyoQueryPayload<{
  schema: XyoCryptoMarketAssetQueryPayloadSchema
}>
