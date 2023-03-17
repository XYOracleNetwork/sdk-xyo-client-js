import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { LocationCertaintyPayload } from './Payload'
import { LocationCertaintySchema } from './Schema'

export const LocationCertaintyPayloadPlugin = () =>
  createPayloadPlugin<LocationCertaintyPayload>({
    schema: LocationCertaintySchema,
  })
