import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketSchema } from './Schema'
import { coingeckoCryptoMarketPayloadTemplate } from './Template'

export const CoingeckoCryptoMarketPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCoingeckoCryptoMarketPayload>({
    schema: XyoCoingeckoCryptoMarketSchema,
    template: coingeckoCryptoMarketPayloadTemplate,
  })
