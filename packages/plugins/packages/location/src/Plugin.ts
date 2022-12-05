import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoLocationWitness, XyoLocationWitnessConfig } from './CurrentLocationWitness'
import { XyoLocationPayloadTemplate } from './Template'

export const XyoLocationPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoLocationPayload, XyoModuleParams<XyoLocationWitnessConfig>>({
    auto: true,
    schema: XyoLocationSchema,
    template: XyoLocationPayloadTemplate,
    witness: async (params) => {
      return await XyoLocationWitness.create(params)
    },
  })
