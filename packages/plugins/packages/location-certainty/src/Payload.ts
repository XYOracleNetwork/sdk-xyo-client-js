import { XyoPayload } from '@xyo-network/payload'

import { LocationCertaintySchema } from './Schema'

export interface LocationCertaintyHeuristic {
  max: number
  mean: number
  min: number
}

export type LocationCertainty = {
  altitude: LocationCertaintyHeuristic
  /** @field Value between 0 and 100 - Certainty Score */
  certainty: number
  elevation: LocationCertaintyHeuristic
  schema: LocationCertaintySchema
  variance: LocationCertaintyHeuristic
}

export const isLocationCertaintyPayload = (x?: XyoPayload | null): x is LocationCertaintyPayload => x?.schema === LocationCertaintySchema

export type LocationCertaintyPayload = XyoPayload<{ schema: LocationCertaintySchema } & LocationCertainty>
