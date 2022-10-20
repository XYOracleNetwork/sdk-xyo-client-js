import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoIdPayload } from './Payload'
import { XyoIdSchema } from './Schema'
import { XyoIdPayloadTemplate } from './Template'
import { XyoIdWitness, XyoIdWitnessConfig } from './Witness'

export const XyoIdPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoIdPayload, XyoModuleParams<XyoIdWitnessConfig>>({
    auto: true,
    schema: XyoIdSchema,
    template: XyoIdPayloadTemplate,
    witness: async (params) => {
      return await XyoIdWitness.create(params)
    },
  })
