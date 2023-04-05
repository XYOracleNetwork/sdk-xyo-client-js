import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketSchema } from './Schema'
import { uniswapCryptoMarketPayloadTemplate } from './Template'

export const UniswapCryptoMarketPayloadPlugin = () =>
  createPayloadPlugin<XyoUniswapCryptoMarketPayload>({
    schema: XyoUniswapCryptoMarketSchema,
    template: uniswapCryptoMarketPayloadTemplate,
  })
