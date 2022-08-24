import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoIdPayload } from './Payload'
import { XyoIdPayloadSchema } from './Schema'
import { XyoIdPayloadTemplate } from './Template'
import { XyoIdWitness, XyoIdWitnessConfig } from './Witness'

export const XyoIdPayloadPlugin: XyoPayloadPluginFunc<XyoIdPayload, XyoIdWitnessConfig> = (config?): XyoPayloadPlugin<XyoIdPayload> =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoIdPayloadSchema,
    template: XyoIdPayloadTemplate,
    witness: (): XyoIdWitness => {
      return new XyoIdWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
