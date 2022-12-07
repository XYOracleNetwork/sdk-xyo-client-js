import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { LocationCertaintyPayload } from './Payload'
import { LocationCertaintySchema } from './Schema'

export const LocationCertaintyPayloadPlugin = () =>
  createXyoPayloadPlugin<LocationCertaintyPayload>({
    schema: LocationCertaintySchema,
  })
