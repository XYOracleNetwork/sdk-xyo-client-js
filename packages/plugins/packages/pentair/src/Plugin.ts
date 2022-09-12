import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoPentairScreenlogicPayload } from './Payload'
import { XyoPentairScreenlogicSchema } from './Schema'
import { XyoPentairScreenlogicWitness, XyoPentairScreenlogicWitnessConfig, XyoPentairScreenlogicWitnessConfigSchema } from './Witness'

export const XyoPentairScreenlogicPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoPentairScreenlogicPayload, XyoPentairScreenlogicWitnessConfig>({
    auto: true,
    schema: XyoPentairScreenlogicSchema,
    witness: (config): XyoPentairScreenlogicWitness => {
      return new XyoPentairScreenlogicWitness({
        ...config,
        schema: XyoPentairScreenlogicWitnessConfigSchema,
        targetSchema: XyoPentairScreenlogicSchema,
      })
    },
  })
