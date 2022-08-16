import { assertEx } from '@xylabs/sdk-js'
import { createXyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketQueryPayload } from './Query'
import { XyoCoingeckoCryptoMarketPayloadSchema } from './Schema'
import { XyoCoingeckoCryptoMarketPayloadTemplate } from './Template'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

export const XyoCoingeckoCryptoMarketPayloadPlugin: XyoPayloadPluginFunc<
  XyoCoingeckoCryptoMarketPayloadSchema,
  XyoCoingeckoCryptoMarketPayload,
  XyoPayloadPluginConfig<XyoWitnessConfig<XyoCoingeckoCryptoMarketQueryPayload>>
> = (config?) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoCoingeckoCryptoMarketPayloadSchema,
    template: XyoCoingeckoCryptoMarketPayloadTemplate,
    witness: (): XyoWitness => {
      return new XyoCoingeckoCryptoMarketWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
