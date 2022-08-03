import { createXyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoQueryWitnessConfig, XyoWitness } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketQueryPayload } from './Query'
import { XyoCoingeckoCryptoMarketPayloadSchema } from './Schema'
import { XyoCoingeckoCryptoMarketPayloadTemplate } from './Template'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

export const XyoCoingeckoCryptoMarketPayloadPlugin: XyoPayloadPluginFunc<
  XyoCoingeckoCryptoMarketPayloadSchema,
  XyoCoingeckoCryptoMarketPayload,
  XyoPayloadPluginConfig<XyoQueryWitnessConfig<XyoCoingeckoCryptoMarketQueryPayload>>
> = (config?) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoCoingeckoCryptoMarketPayloadSchema,
    template: XyoCoingeckoCryptoMarketPayloadTemplate,
    witness: (): XyoWitness => {
      return new XyoCoingeckoCryptoMarketWitness(config?.witness)
    },
  })
