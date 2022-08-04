import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoIdPayload } from './Payload'
import { XyoIdPayloadTemplate } from './Template'
import { XyoIdWitness } from './Witness'

export const XyoIdPayloadPlugin: XyoPayloadPluginFunc<'network.xyo.id', XyoIdPayload> = () =>
  createXyoPayloadPlugin({
    auto: true,
    schema: 'network.xyo.id',
    template: XyoIdPayloadTemplate,
    witness: (): XyoIdWitness => {
      return new XyoIdWitness()
    },
  })
