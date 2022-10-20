import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoLocationElevationPayload } from './Payload'
import { XyoLocationElevationSchema } from './Schema'
import { XyoLocationElevationPayloadTemplate } from './Template'
import { XyoLocationElevationWitness, XyoLocationElevationWitnessConfig } from './Witness'

export const XyoLocationElevationPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoLocationElevationPayload, XyoModuleParams<XyoLocationElevationWitnessConfig>>({
    auto: true,
    schema: XyoLocationElevationSchema,
    template: XyoLocationElevationPayloadTemplate,
    witness: async (params) => {
      return await XyoLocationElevationWitness.create(params)
    },
  })
