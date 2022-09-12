import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoIdPayload } from './Payload'
import { XyoIdSchema } from './Schema'
import { XyoIdPayloadTemplate } from './Template'
import { XyoIdWitness, XyoIdWitnessConfig, XyoIdWitnessConfigSchema } from './Witness'

export const XyoIdPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoIdPayload, XyoIdWitnessConfig>({
    auto: true,
    schema: XyoIdSchema,
    template: XyoIdPayloadTemplate,
    witness: (config): XyoIdWitness => {
      return new XyoIdWitness({
        ...config,
        schema: XyoIdWitnessConfigSchema,
        targetSchema: XyoIdSchema,
      })
    },
  })
