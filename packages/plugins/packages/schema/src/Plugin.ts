import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoSchemaPayload } from './Payload'
import { XyoSchemaPayloadSchema } from './Schema'
import { XyoSchemaWitness } from './Witness'

export const XyoSchemaPayloadPlugin: XyoPayloadPluginFunc<XyoSchemaPayloadSchema, XyoSchemaPayload> = (config?) =>
  createXyoPayloadPlugin({
    schema: XyoSchemaPayloadSchema,
    witness: (): XyoSchemaWitness => {
      return new XyoSchemaWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
