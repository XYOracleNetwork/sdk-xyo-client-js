import { asSchema, isPayload } from '@xyo-network/payload-model'

import { LocationWitnessSchema } from '../../Witnesses/index.ts'

export const LocationTimeRangeQuerySchema = asSchema('network.xyo.location.range.query', true)
export type LocationTimeRangeQuerySchema = typeof LocationTimeRangeQuerySchema

export const LocationTimeRangeAnswerSchema = asSchema('network.xyo.location.range.answer', true)
export type LocationTimeRangeAnswerSchema = typeof LocationTimeRangeAnswerSchema

export type LocationTimeRangeQuery = {
  schema: LocationWitnessSchema
  startTime?: string
  stopTime?: string

  // TODO: Bounding rectangle, etc.
}

export const isLocationTimeRangeQuery = isPayload([LocationWitnessSchema])
