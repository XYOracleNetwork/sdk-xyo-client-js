import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoIdPayload } from './Payload'
import { XyoIdPayloadTemplate } from './Template'
import { XyoIdWitness, XyoIdWitnessConfig } from './Witness'

export const XyoIdPayloadPlugin: XyoPayloadPluginFunc<'network.xyo.id', XyoIdPayload, XyoPayloadPluginConfig<XyoIdWitnessConfig>> = (config?) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: 'network.xyo.id',
    template: XyoIdPayloadTemplate,
    witness: (): XyoIdWitness => {
      return new XyoIdWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
