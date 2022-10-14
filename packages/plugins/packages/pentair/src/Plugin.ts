import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoPentairScreenlogicPayload } from './Payload'
import { XyoPentairScreenlogicSchema } from './Schema'
import { XyoPentairScreenlogicWitness, XyoPentairScreenlogicWitnessConfig } from './Witness'

export const XyoPentairScreenlogicPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoPentairScreenlogicPayload, XyoPentairScreenlogicWitnessConfig>({
    auto: true,
    schema: XyoPentairScreenlogicSchema,
    witness: (params): XyoPentairScreenlogicWitness => {
      return new XyoPentairScreenlogicWitness(params)
    },
  })
