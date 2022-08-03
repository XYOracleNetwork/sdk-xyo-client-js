import { XyoQueryPayload } from '@xyo-network/payload'

import { XyoCryptoMarketUniswapQueryPayloadSchema } from './Schema'

export type XyoCryptoMarketUniswapQueryPayload = XyoQueryPayload<{
  schema: XyoCryptoMarketUniswapQueryPayloadSchema
  pools: string[]
}>
