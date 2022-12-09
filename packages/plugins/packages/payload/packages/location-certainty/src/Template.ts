import { LocationCertaintyPayload } from './Payload'
import { LocationCertaintySchema } from './Schema'

export const LocationCertaintyPayloadTemplate = (): Partial<LocationCertaintyPayload> => {
  return {
    altitude: undefined,
    certainty: undefined,
    elevation: undefined,
    schema: LocationCertaintySchema,
    variance: undefined,
  }
}
