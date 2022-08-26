import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketPayloadSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'
import { XyoCoingeckoCryptoMarketPayloadTemplate } from './Template'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

export const XyoCoingeckoCryptoMarketPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketWitnessConfig>({
    auto: true,
    schema: XyoCoingeckoCryptoMarketPayloadSchema,
    template: XyoCoingeckoCryptoMarketPayloadTemplate,
    witness: (config) => {
      return new XyoCoingeckoCryptoMarketWitness({
        ...config,
        schema: XyoCoingeckoCryptoMarketWitnessConfigSchema,
        targetSchema: XyoCoingeckoCryptoMarketPayloadSchema,
      })
    },
  })
