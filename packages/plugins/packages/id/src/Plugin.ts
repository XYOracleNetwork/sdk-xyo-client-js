import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoIdPayload } from './Payload'
import { XyoIdPayloadSchema } from './Schema'
import { XyoIdPayloadTemplate } from './Template'
import { XyoIdWitness, XyoIdWitnessConfig, XyoIdWitnessConfigSchema } from './Witness'

export const XyoIdPayloadPlugin: XyoPayloadPluginFunc<
  XyoIdPayload,
  XyoIdWitnessConfigSchema,
  XyoPayloadPluginConfig<XyoIdPayload, XyoIdWitnessConfigSchema, XyoIdWitnessConfig>
> = (config?): XyoPayloadPlugin<XyoIdPayload> =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoIdPayloadSchema,
    template: XyoIdPayloadTemplate,
    witness: (): XyoIdWitness => {
      return new XyoIdWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
