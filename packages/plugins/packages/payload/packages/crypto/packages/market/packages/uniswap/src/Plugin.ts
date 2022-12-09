import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketSchema } from './Schema'
import { uniswapCryptoMarketPayloadTemplate } from './Template'

export const UniswapCryptoMarketPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoUniswapCryptoMarketPayload>({
    schema: XyoUniswapCryptoMarketSchema,
    template: uniswapCryptoMarketPayloadTemplate,
  })
