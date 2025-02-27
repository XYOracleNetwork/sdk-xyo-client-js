import type { NetworkNodePayload } from './NetworkNodePayload.ts'
import { NetworkNodeSchema } from './NetworkNodePayload.ts'

const beta = (): NetworkNodePayload => {
  return {
    name: 'XYO Location (beta)',
    schema: NetworkNodeSchema,
    slug: 'beta',
    type: 'diviner',
    uri: 'https://beta.api.location.diviner.xyo.network',
    web: 'https://beta.explore.xyo.network',
  }
}

const main = (): NetworkNodePayload => {
  return {
    name: 'XYO Location',
    schema: NetworkNodeSchema,
    slug: 'main',
    type: 'diviner',
    uri: 'https://api.location.diviner.xyo.network',
    web: 'https://explore.xyo.network',
  }
}

export const knownDiviners = (): NetworkNodePayload[] => [beta(), main()]
