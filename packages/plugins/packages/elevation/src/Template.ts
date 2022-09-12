import { XyoElevationPayload } from './Payload'
import { XyoElevationSchema } from './Schema'

export const XyoElevationPayloadTemplate = (): XyoElevationPayload => {
  return {
    elevation: undefined,
    latitude: undefined,
    longitude: undefined,
    schema: XyoElevationSchema,
  }
}
