import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketSchema } from './Schema'

export const uniswapCryptoMarketPayloadTemplate = (): Partial<XyoUniswapCryptoMarketPayload> => ({
  schema: XyoUniswapCryptoMarketSchema,
})
