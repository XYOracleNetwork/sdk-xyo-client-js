import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { CoingeckoCryptoMarketPayload } from './Payload'
import { CoingeckoCryptoMarketSchema } from './Schema'
import { coingeckoCryptoMarketPayloadTemplate } from './Template'

export const CoingeckoCryptoMarketPayloadPlugin = () =>
  createPayloadPlugin<CoingeckoCryptoMarketPayload>({
    schema: CoingeckoCryptoMarketSchema,
    template: coingeckoCryptoMarketPayloadTemplate,
  })
