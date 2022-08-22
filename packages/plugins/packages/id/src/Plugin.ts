import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoIdPayload } from './Payload'
import { XyoIdPayloadSchema } from './Schema'
import { XyoIdPayloadTemplate } from './Template'
import { XyoIdWitness, XyoIdWitnessConfig, XyoIdWitnessConfigSchema } from './Witness'

export const XyoIdPayloadPlugin: XyoPayloadPluginFunc<
  XyoIdPayloadSchema,
  XyoIdPayload,
  XyoIdWitnessConfigSchema,
  XyoPayloadPluginConfig<XyoIdPayloadSchema, XyoIdWitnessConfigSchema, XyoIdWitnessConfig>
> = (config?) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoIdPayloadSchema,
    template: XyoIdPayloadTemplate,
    witness: (): XyoIdWitness => {
      return new XyoIdWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
