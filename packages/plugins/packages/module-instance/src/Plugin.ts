import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoModuleInstancePayload } from './Payload'
import { XyoModuleInstanceSchema } from './Schema'
import { XyoModuleInstancePayloadTemplate } from './Template'
import { XyoModuleInstanceWitness, XyoModuleInstanceWitnessConfig } from './Witness'

export const XyoModuleInstancePayloadPlugin = () =>
  createXyoPayloadPlugin<XyoModuleInstancePayload, XyoModuleParams<XyoModuleInstanceWitnessConfig>>({
    schema: XyoModuleInstanceSchema,
    template: XyoModuleInstancePayloadTemplate,
    witness: async (params) => {
      return await XyoModuleInstanceWitness.create(params)
    },
  })
