import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { LocationCertaintyDivinerSchema } from './Schema'

export interface LocationCertaintyHeuristic {
  max: number
  mean: number
  min: number
}

export type LocationCertaintyPayload = Query<{
  altitude: LocationCertaintyHeuristic
  /** @field Value between 0 and 100 - Certainty Score */
  certainty: number
  elevation: LocationCertaintyHeuristic
  schema: LocationCertaintyDivinerSchema
  variance: LocationCertaintyHeuristic
}>

export const isLocationCertaintyPayload = (x?: Payload | null): x is LocationCertaintyPayload => x?.schema === LocationCertaintyDivinerSchema
