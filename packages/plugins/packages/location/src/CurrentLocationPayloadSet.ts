import { GeographicLocationSchema } from './GeographicLocationSchema'
import { LocationHeadingSchema } from './HeadingSchema'
import { PayloadSetPayload } from './PayloadSetPayload'
import { PayloadSetSchema } from './PayloadSetSchema'

export const CurrentLocationPayloadSet: PayloadSetPayload = {
  optional: {
    [LocationHeadingSchema]: 1,
  },
  required: {
    [GeographicLocationSchema]: 1,
  },
  schema: PayloadSetSchema,
}
