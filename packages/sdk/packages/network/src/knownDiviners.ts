import { XyoNetworkNodePayload, XyoNetworkNodeSchema } from './XyoNetworkNodePayload'

const beta = (): XyoNetworkNodePayload => {
  return {
    name: 'XYO Location (beta)',
    schema: XyoNetworkNodeSchema,
    slug: 'beta',
    type: 'diviner',
    uri: 'https://beta.api.location.diviner.xyo.network',
    web: 'https://beta.explore.xyo.network',
  }
}

const main = (): XyoNetworkNodePayload => {
  return {
    name: 'XYO Location',
    schema: XyoNetworkNodeSchema,
    slug: 'main',
    type: 'diviner',
    uri: 'https://api.location.diviner.xyo.network',
    web: 'https://explore.xyo.network',
  }
}

export const knownDiviners = (): XyoNetworkNodePayload[] => [beta(), main()]
