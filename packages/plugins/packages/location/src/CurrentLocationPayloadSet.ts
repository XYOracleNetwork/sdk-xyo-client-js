import { PayloadSetPayload, PayloadSetSchema } from '@xyo-network/payload'

import { GeographicCoordinateSystemLocationSchema } from './GeographicCoordinateSystemLocationSchema'
import { LocationHeadingSchema } from './HeadingSchema'

export const CurrentLocationPayloadSet: PayloadSetPayload = {
  optional: {
    [LocationHeadingSchema]: 1,
  },
  required: {
    [GeographicCoordinateSystemLocationSchema]: 1,
  },
  schema: PayloadSetSchema,
}
