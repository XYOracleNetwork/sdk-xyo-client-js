import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoLocationPayload } from './Payload'
import { XyoLocationSchema } from './Schema'
import { XyoLocationPayloadTemplate } from './Template'
import { XyoLocationWitness, XyoLocationWitnessConfig, XyoLocationWitnessConfigSchema } from './Witness'

export const XyoLocationPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoLocationPayload, XyoLocationWitnessConfig>({
    auto: true,
    schema: XyoLocationSchema,
    template: XyoLocationPayloadTemplate,
    witness: (config): XyoLocationWitness => {
      return new XyoLocationWitness({
        ...config,
        schema: XyoLocationWitnessConfigSchema,
        targetSchema: XyoLocationSchema,
      })
    },
  })
