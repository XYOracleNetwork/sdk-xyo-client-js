import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { LocationPayload } from './GeographicCoordinateSystemLocationPayload'
import { LocationSchema } from './GeographicCoordinateSystemLocationSchema'

export const LocationPayloadPlugin = () =>
  createPayloadPlugin<LocationPayload>({
    schema: LocationSchema,
  })
