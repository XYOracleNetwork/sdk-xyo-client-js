import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoSchemaPayload } from './Payload'
import { XyoSchemaPayloadSchema } from './Schema'
import { XyoSchemaWitness, XyoSchemaWitnessConfig } from './Witness'

export const XyoSchemaPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoSchemaPayload, XyoSchemaWitnessConfig>({
    schema: XyoSchemaPayloadSchema,
    witness: (config): XyoSchemaWitness => {
      return new XyoSchemaWitness(config)
    },
  })
