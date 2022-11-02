import { LocationWitnessSchema } from '../../Witnesses'

export type LocationTimeRangeQuerySchema = 'network.xyo.location.range.query'
export const LocationTimeRangeQuerySchema: LocationTimeRangeQuerySchema = 'network.xyo.location.range.query'

export type LocationTimeRangeAnswerSchema = 'network.xyo.location.range.answer'
export const LocationTimeRangeAnswerSchema: LocationTimeRangeAnswerSchema = 'network.xyo.location.range.answer'

export type LocationTimeRangeQuery = {
  schema: LocationWitnessSchema
  startTime?: string
  stopTime?: string

  // TODO: Bounding rectangle, etc.
}

export const isLocationTimeRangeQuery = (query: Record<string, unknown>): query is LocationTimeRangeQuery => {
  return query && query?.schema === LocationTimeRangeAnswerSchema
}
