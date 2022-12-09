import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { LocationPayload } from './GeographicCoordinateSystemLocationPayload'
import { LocationSchema } from './GeographicCoordinateSystemLocationSchema'

export const LocationPayloadPlugin = () =>
  createXyoPayloadPlugin<LocationPayload>({
    schema: LocationSchema,
  })
