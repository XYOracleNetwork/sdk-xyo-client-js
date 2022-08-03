import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketPayloadSchema } from './Schema'

export const XyoUniswapCryptoMarketPayloadTemplate = (): Partial<XyoUniswapCryptoMarketPayload> => ({
  schema: XyoUniswapCryptoMarketPayloadSchema,
})
