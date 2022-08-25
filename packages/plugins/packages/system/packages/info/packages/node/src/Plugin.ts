import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoNodeSystemInfoWitnessConfig } from './Config'
import { XyoNodeSystemInfoPayload } from './Payload'
import { XyoNodeSystemInfoPayloadSchema } from './Schema'
import { XyoNodeSystemInfoWitness } from './Witness'

export const XyoNodeSystemInfoPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoNodeSystemInfoPayload, XyoNodeSystemInfoWitnessConfig>({
    auto: true,
    schema: XyoNodeSystemInfoPayloadSchema,
    witness: (config): XyoNodeSystemInfoWitness => {
      return new XyoNodeSystemInfoWitness(config)
    },
  })
