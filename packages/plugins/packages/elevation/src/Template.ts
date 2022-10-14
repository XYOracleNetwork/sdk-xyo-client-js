import { XyoLocationElevationPayload } from './Payload'
import { XyoLocationElevationSchema } from './Schema'

export const XyoLocationElevationPayloadTemplate = (): XyoLocationElevationPayload => {
  return {
    elevation: undefined,
    quadkey: undefined,
    schema: XyoLocationElevationSchema,
  }
}
