import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoNodeSystemInfoWitnessConfig } from './Config'
import { XyoNodeSystemInfoPayload } from './Payload'
import { XyoNodeSystemInfoPayloadSchema } from './Schema'
import { XyoNodeSystemInfoWitness } from './Witness'

export const XyoNodeSystemInfoPayloadPlugin: XyoPayloadPluginFunc<XyoNodeSystemInfoPayload, XyoNodeSystemInfoWitnessConfig> = (config?) =>
  createXyoPayloadPlugin<XyoNodeSystemInfoPayload>({
    auto: true,
    schema: XyoNodeSystemInfoPayloadSchema,
    witness: (): XyoNodeSystemInfoWitness => {
      return new XyoNodeSystemInfoWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
