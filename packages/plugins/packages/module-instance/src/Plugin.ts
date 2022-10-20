import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoModuleInstancePayload } from './Payload'
import { XyoModuleInstanceSchema } from './Schema'
import { XyoModuleInstancePayloadTemplate } from './Template'
import { XyoModuleInstanceWitness, XyoModuleInstanceWitnessConfig, XyoModuleInstanceWitnessConfigSchema } from './Witness'

export const XyoModuleInstancePayloadPlugin = () =>
  createXyoPayloadPlugin<XyoModuleInstancePayload, XyoModuleInstanceWitnessConfig>({
    schema: XyoModuleInstanceSchema,
    template: XyoModuleInstancePayloadTemplate,
    witness: (config): XyoModuleInstanceWitness => {
      return new XyoModuleInstanceWitness({
        ...config,
        schema: XyoModuleInstanceWitnessConfigSchema,
        targetSchema: XyoModuleInstanceSchema,
      })
    },
  })
