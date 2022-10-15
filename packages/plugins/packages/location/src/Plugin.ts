import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoLocationPayload } from './Payload'
import { XyoLocationSchema } from './Schema'
import { XyoLocationPayloadTemplate } from './Template'
import { XyoLocationWitness, XyoLocationWitnessConfig } from './Witness'

export const XyoLocationPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoLocationPayload, XyoLocationWitnessConfig>({
    auto: true,
    schema: XyoLocationSchema,
    template: XyoLocationPayloadTemplate,
    witness: async (params) => {
      return await new XyoLocationWitness(params).start()
    },
  })
