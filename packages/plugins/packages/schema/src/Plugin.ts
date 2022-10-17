import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoSchemaPayload } from './Payload'
import { XyoSchemaSchema } from './Schema'
import { XyoSchemaWitness, XyoSchemaWitnessConfig } from './Witness'

export const XyoSchemaPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoSchemaPayload, XyoSchemaWitnessConfig>({
    schema: XyoSchemaSchema,
    witness: async (params) => {
      return await XyoSchemaWitness.create(params)
    },
  })
