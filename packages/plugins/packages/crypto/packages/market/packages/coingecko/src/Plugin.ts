import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketSchema } from './Schema'
import { XyoCoingeckoCryptoMarketPayloadTemplate } from './Template'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

export const XyoCoingeckoCryptoMarketPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketWitnessConfig>({
    auto: true,
    schema: XyoCoingeckoCryptoMarketSchema,
    template: XyoCoingeckoCryptoMarketPayloadTemplate,
    witness: (params) => {
      return new XyoCoingeckoCryptoMarketWitness(params)
    },
  })
