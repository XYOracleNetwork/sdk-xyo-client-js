import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoSchemaPayload } from './Payload'
import { XyoSchemaSchema } from './Schema'
import { XyoSchemaWitness, XyoSchemaWitnessConfig, XyoSchemaWitnessConfigSchema } from './Witness'

export const XyoSchemaPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoSchemaPayload, XyoSchemaWitnessConfig>({
    schema: XyoSchemaSchema,
    witness: (config): XyoSchemaWitness => {
      return new XyoSchemaWitness({
        ...config,
        schema: XyoSchemaWitnessConfigSchema,
        targetSchema: XyoSchemaSchema,
      })
    },
  })
