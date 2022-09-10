import { XyoLocationPayload } from './Payload'
import { XyoLocationSchema } from './Schema'

export const XyoLocationPayloadTemplate = (): XyoLocationPayload => {
  return {
    accuracy: undefined,
    altitude: undefined,
    altitudeAccuracy: undefined,
    heading: undefined,
    latitude: undefined,
    longitude: undefined,
    schema: XyoLocationSchema,
    speed: undefined,
    time: Date.now(),
  }
}
