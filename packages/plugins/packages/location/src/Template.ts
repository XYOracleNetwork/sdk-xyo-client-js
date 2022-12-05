import { XyoLocationPayload } from './HeadingPayload'
import { XyoLocationSchema } from './Schema'

export const XyoLocationPayloadTemplate = (): Partial<XyoLocationPayload> => {
  return {
    accuracy: undefined,
    altitude: undefined,
    altitudeAccuracy: undefined,
    heading: undefined,
    latitude: undefined,
    longitude: undefined,
    quadkey: undefined,
    schema: XyoLocationSchema,
    speed: undefined,
    time: Date.now(),
  }
}
