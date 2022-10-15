import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoLocationElevationPayload } from './Payload'
import { XyoLocationElevationSchema } from './Schema'
import { XyoLocationElevationPayloadTemplate } from './Template'
import { XyoLocationElevationWitness, XyoLocationElevationWitnessConfig } from './Witness'

export const XyoLocationElevationPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoLocationElevationPayload, XyoLocationElevationWitnessConfig>({
    auto: true,
    schema: XyoLocationElevationSchema,
    template: XyoLocationElevationPayloadTemplate,
    witness: async (params) => {
      return await new XyoLocationElevationWitness(params).start()
    },
  })
