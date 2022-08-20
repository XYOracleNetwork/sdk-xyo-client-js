import { assertEx } from '@xylabs/sdk-js'
import { createXyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoWitness } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketPayloadSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'
import { XyoCoingeckoCryptoMarketPayloadTemplate } from './Template'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

export const XyoCoingeckoCryptoMarketPayloadPlugin: XyoPayloadPluginFunc<
  XyoCoingeckoCryptoMarketPayloadSchema,
  XyoCoingeckoCryptoMarketPayload,
  XyoCoingeckoCryptoMarketWitnessConfigSchema,
  XyoPayloadPluginConfig<XyoCoingeckoCryptoMarketPayloadSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema, XyoCoingeckoCryptoMarketWitnessConfig>
> = (config?) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoCoingeckoCryptoMarketPayloadSchema,
    template: XyoCoingeckoCryptoMarketPayloadTemplate,
    witness: (): XyoWitness => {
      return new XyoCoingeckoCryptoMarketWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
