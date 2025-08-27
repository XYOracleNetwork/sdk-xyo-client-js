import { isPayload } from '@xyo-network/payload-model'

import { LocationWitnessSchema } from '../../Witnesses/LocationWitness.ts'

export const LocationTimeRangeQuerySchema = 'network.xyo.location.range.query' as const
export type LocationTimeRangeQuerySchema = typeof LocationTimeRangeQuerySchema

export const LocationTimeRangeAnswerSchema = 'network.xyo.location.range.answer' as const
export type LocationTimeRangeAnswerSchema = typeof LocationTimeRangeAnswerSchema

export type LocationTimeRangeQuery = {
  schema: LocationWitnessSchema
  startTime?: string
  stopTime?: string

  // TODO: Bounding rectangle, etc.
}

export const isLocationTimeRangeQuery = isPayload([LocationWitnessSchema])
