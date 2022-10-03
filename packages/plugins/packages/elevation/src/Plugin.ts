import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoLocationElevationPayload } from './Payload'
import { XyoLocationElevationSchema } from './Schema'
import { XyoLocationElevationPayloadTemplate } from './Template'
import { XyoLocationElevationWitness, XyoLocationElevationWitnessConfig, XyoLocationElevationWitnessConfigSchema } from './Witness'

export const XyoElevationPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoLocationElevationPayload, XyoLocationElevationWitnessConfig>({
    auto: true,
    schema: XyoLocationElevationSchema,
    template: XyoLocationElevationPayloadTemplate,
    witness: (config): XyoLocationElevationWitness => {
      return new XyoLocationElevationWitness({
        ...config,
        schema: XyoLocationElevationWitnessConfigSchema,
        targetSchema: XyoLocationElevationSchema,
      })
    },
  })
