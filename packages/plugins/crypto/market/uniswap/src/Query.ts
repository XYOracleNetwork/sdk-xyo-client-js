import { XyoQueryPayload } from '@xyo-network/payload'

import { XyoUniswapCryptoMarketQueryPayloadSchema } from './Schema'

export type XyoUniswapCryptoMarketQueryPayload = XyoQueryPayload<{
  schema: XyoUniswapCryptoMarketQueryPayloadSchema
  pools: string[]
}>
