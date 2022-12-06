import { PayloadSetPayload, PayloadSetSchema } from '@xyo-network/payload'

import { LocationSchema } from './GeographicCoordinateSystemLocationSchema'
import { LocationHeadingSchema } from './HeadingSchema'

export const CurrentLocationPayloadSet: PayloadSetPayload = {
  optional: {
    [LocationHeadingSchema]: 1,
  },
  required: {
    [LocationSchema]: 1,
  },
  schema: PayloadSetSchema,
}
