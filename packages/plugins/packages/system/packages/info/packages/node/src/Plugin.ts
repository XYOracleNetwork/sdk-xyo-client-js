import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoNodeSystemInfoWitnessConfig, XyoNodeSystemInfoWitnessConfigSchema } from './Config'
import { XyoNodeSystemInfoPayload } from './Payload'
import { XyoNodeSystemInfoSchema } from './Schema'
import { XyoNodeSystemInfoWitness } from './Witness'

export const XyoNodeSystemInfoPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoNodeSystemInfoPayload, XyoNodeSystemInfoWitnessConfig>({
    auto: true,
    schema: XyoNodeSystemInfoSchema,
    witness: (config): XyoNodeSystemInfoWitness => {
      return new XyoNodeSystemInfoWitness({
        ...config,
        schema: XyoNodeSystemInfoWitnessConfigSchema,
        targetSchema: XyoNodeSystemInfoSchema,
      })
    },
  })
