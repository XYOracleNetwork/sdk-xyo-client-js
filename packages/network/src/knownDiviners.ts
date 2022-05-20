import { XyoNetworkNodePayloadSchema } from './schema'
import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'

const beta = (): XyoNetworkNodePayload => {
  return {
    name: 'XYO Location (beta)',
    schema: XyoNetworkNodePayloadSchema,
    type: 'diviner',
    uri: 'https://beta.api.location.diviner.xyo.network',
    web: 'https://beta.explore.xyo.network',
  }
}

const main = (): XyoNetworkNodePayload => {
  return {
    name: 'XYO Location',
    schema: XyoNetworkNodePayloadSchema,
    type: 'diviner',
    uri: 'https://api.location.diviner.xyo.network',
    web: 'https://explore.xyo.network',
  }
}

export const knownDiviners = (): XyoNetworkNodePayload[] => [beta(), main()]
