import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketSchema } from './Schema'

export const XyoUniswapCryptoMarketPayloadTemplate = (): Partial<XyoUniswapCryptoMarketPayload> => ({
  schema: XyoUniswapCryptoMarketSchema,
})
