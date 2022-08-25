import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoLocationPayload } from './Payload'
import { XyoLocationPayloadSchema } from './Schema'
import { XyoLocationPayloadTemplate } from './Template'
import { XyoLocationWitness, XyoLocationWitnessConfig, XyoLocationWitnessConfigSchema } from './Witness'

export const XyoLocationPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoLocationPayload, XyoLocationWitnessConfig>({
    auto: true,
    schema: XyoLocationPayloadSchema,
    template: XyoLocationPayloadTemplate,
    witness: (config): XyoLocationWitness => {
      return new XyoLocationWitness({
        ...config,
        schema: XyoLocationWitnessConfigSchema,
        targetSchema: XyoLocationPayloadSchema,
      })
    },
  })
