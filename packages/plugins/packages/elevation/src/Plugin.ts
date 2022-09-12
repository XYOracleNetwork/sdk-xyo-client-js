import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoElevationPayload } from './Payload'
import { XyoElevationSchema } from './Schema'
import { XyoElevationPayloadTemplate } from './Template'
import { XyoElevationWitness, XyoElevationWitnessConfig, XyoElevationWitnessConfigSchema } from './Witness'

export const XyoElevationPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoElevationPayload, XyoElevationWitnessConfig>({
    auto: true,
    schema: XyoElevationSchema,
    template: XyoElevationPayloadTemplate,
    witness: (config): XyoElevationWitness => {
      return new XyoElevationWitness({
        ...config,
        schema: XyoElevationWitnessConfigSchema,
        targetSchema: XyoElevationSchema,
      })
    },
  })
