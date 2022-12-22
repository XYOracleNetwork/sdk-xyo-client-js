import { LocationHeadingSchema, LocationSchema } from '@xyo-network/location-payload-plugin'
import { PayloadSetPayload, PayloadSetSchema } from '@xyo-network/payload-model'

export const CurrentLocationPayloadSet: PayloadSetPayload = {
  optional: {
    [LocationHeadingSchema]: 1,
  },
  required: {
    [LocationSchema]: 1,
  },
  schema: PayloadSetSchema,
}
