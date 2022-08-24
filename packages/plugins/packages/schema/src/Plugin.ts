import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoSchemaPayload } from './Payload'
import { XyoSchemaPayloadSchema } from './Schema'
import { XyoSchemaWitness, XyoSchemaWitnessConfig } from './Witness'

export const XyoSchemaPayloadPlugin: XyoPayloadPluginFunc<XyoSchemaPayload, XyoSchemaWitnessConfig> = (config?): XyoPayloadPlugin<XyoSchemaPayload> =>
  createXyoPayloadPlugin({
    schema: XyoSchemaPayloadSchema,
    witness: (): XyoSchemaWitness => {
      return new XyoSchemaWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
