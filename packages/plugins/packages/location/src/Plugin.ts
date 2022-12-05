import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { CurrentLocationWitness, CurrentLocationWitnessConfig } from './CurrentLocationWitness'
import { GeographicCoordinateSystemLocationPayload } from './GeographicCoordinateSystemLocationPayload'
import { GeographicCoordinateSystemLocationSchema } from './GeographicCoordinateSystemLocationSchema'

export const GeographicCoordinateSystemLocationPayloadPlugin = () =>
  createXyoPayloadPlugin<GeographicCoordinateSystemLocationPayload, XyoModuleParams<CurrentLocationWitnessConfig>>({
    auto: true,
    schema: GeographicCoordinateSystemLocationSchema,
    witness: async (params) => {
      return await CurrentLocationWitness.create(params)
    },
  })
