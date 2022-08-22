import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoNodeSystemInfoWitnessConfigSchema } from './Config'
import { XyoNodeSystemInfoPayload } from './Payload'
import { XyoNodeSystemInfoPayloadSchema } from './Schema'
import { XyoNodeSystemInfoWitness } from './Witness'

export const XyoNodeSystemInfoPayloadPlugin: XyoPayloadPluginFunc<
  XyoNodeSystemInfoPayloadSchema,
  XyoNodeSystemInfoPayload,
  XyoNodeSystemInfoWitnessConfigSchema
> = (config?) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoNodeSystemInfoPayloadSchema,
    witness: (): XyoNodeSystemInfoWitness => {
      return new XyoNodeSystemInfoWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
