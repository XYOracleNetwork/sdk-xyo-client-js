import { ElevationPayload } from './Payload'
import { ElevationSchema } from './Schema'

export const elevationPayloadTemplate = (): ElevationPayload => {
  return {
    elevation: undefined,
    schema: ElevationSchema,
  }
}
