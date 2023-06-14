import { CoingeckoCryptoMarketPayload } from './Payload'
import { CoingeckoCryptoMarketSchema } from './Schema'

export const coingeckoCryptoMarketPayloadTemplate = (): Partial<CoingeckoCryptoMarketPayload> => ({
  schema: CoingeckoCryptoMarketSchema,
})
