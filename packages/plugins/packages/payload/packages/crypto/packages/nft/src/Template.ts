import { UniswapCryptoMarketPayload } from './Payload'
import { UniswapCryptoMarketSchema } from './Schema'

export const uniswapCryptoMarketPayloadTemplate = (): Partial<UniswapCryptoMarketPayload> => ({
  schema: UniswapCryptoMarketSchema,
})
