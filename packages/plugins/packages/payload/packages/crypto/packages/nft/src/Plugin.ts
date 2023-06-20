import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { UniswapCryptoMarketPayload } from './Payload'
import { UniswapCryptoMarketSchema } from './Schema'
import { uniswapCryptoMarketPayloadTemplate } from './Template'

export const UniswapCryptoMarketPayloadPlugin = () =>
  createPayloadPlugin<UniswapCryptoMarketPayload>({
    schema: UniswapCryptoMarketSchema,
    template: uniswapCryptoMarketPayloadTemplate,
  })
