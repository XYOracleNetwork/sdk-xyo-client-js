import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoLocationPayload } from './Payload'
import { XyoLocationSchema } from './Schema'
import { XyoLocationPayloadTemplate } from './Template'
import { XyoLocationWitness, XyoLocationWitnessConfig } from './Witness'

export const XyoLocationPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoLocationPayload, XyoModuleParams<XyoLocationWitnessConfig>>({
    auto: true,
    schema: XyoLocationSchema,
    template: XyoLocationPayloadTemplate,
    witness: async (params) => {
      return await XyoLocationWitness.create(params)
    },
  })
