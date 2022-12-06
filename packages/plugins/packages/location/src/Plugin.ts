import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { CurrentLocationWitness, CurrentLocationWitnessConfig } from './CurrentLocationWitness'
import { LocationPayload } from './GeographicCoordinateSystemLocationPayload'
import { LocationSchema } from './GeographicCoordinateSystemLocationSchema'

export const LocationPayloadPlugin = () =>
  createXyoPayloadPlugin<LocationPayload, XyoModuleParams<CurrentLocationWitnessConfig>>({
    auto: true,
    schema: LocationSchema,
    witness: async (params) => {
      return await CurrentLocationWitness.create(params)
    },
  })
