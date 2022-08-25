import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoIdPayload } from './Payload'
import { XyoIdPayloadSchema } from './Schema'
import { XyoIdPayloadTemplate } from './Template'
import { XyoIdWitness, XyoIdWitnessConfig } from './Witness'

export const XyoIdPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoIdPayload, XyoIdWitnessConfig>({
    auto: true,
    schema: XyoIdPayloadSchema,
    template: XyoIdPayloadTemplate,
    witness: (config): XyoIdWitness => {
      return new XyoIdWitness(config)
    },
  })
