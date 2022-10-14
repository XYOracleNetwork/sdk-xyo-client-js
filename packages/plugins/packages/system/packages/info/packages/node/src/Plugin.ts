import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoNodeSystemInfoWitnessConfig } from './Config'
import { XyoNodeSystemInfoPayload } from './Payload'
import { XyoNodeSystemInfoSchema } from './Schema'
import { XyoNodeSystemInfoWitness } from './Witness'

export const XyoNodeSystemInfoPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoNodeSystemInfoPayload, XyoNodeSystemInfoWitnessConfig>({
    auto: true,
    schema: XyoNodeSystemInfoSchema,
    witness: (params): XyoNodeSystemInfoWitness => {
      return new XyoNodeSystemInfoWitness(params)
    },
  })
