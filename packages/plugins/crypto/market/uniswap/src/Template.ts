import { XyoCryptoMarketUniswapPayload } from './Payload'
import { XyoCryptoMarketUniswapPayloadSchema } from './Schema'

export const XyoCryptoMarketUniswapPayloadTemplate = (): Partial<XyoCryptoMarketUniswapPayload> => ({
  schema: XyoCryptoMarketUniswapPayloadSchema,
})
