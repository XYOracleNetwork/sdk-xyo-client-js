import { XyoLocationElevationPayload } from './Payload'
import { XyoLocationElevationSchema } from './Schema'

export const XyoLocationElevationPayloadTemplate = (): XyoLocationElevationPayload => {
  return {
    elevation: undefined,
    latitude: undefined,
    longitude: undefined,
    schema: XyoLocationElevationSchema,
  }
}
