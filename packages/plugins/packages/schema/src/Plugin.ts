import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoSchemaPayload } from './Payload'
import { XyoSchemaPayloadSchema } from './Schema'
import { XyoSchemaWitness, XyoSchemaWitnessConfigSchema } from './Witness'

export const XyoSchemaPayloadPlugin: XyoPayloadPluginFunc<XyoSchemaPayloadSchema, XyoSchemaPayload, XyoSchemaWitnessConfigSchema> = (
  config?,
): XyoPayloadPlugin<XyoSchemaPayload> =>
  createXyoPayloadPlugin({
    schema: XyoSchemaPayloadSchema,
    witness: (): XyoSchemaWitness => {
      return new XyoSchemaWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
