import type { LocationWitnessSchema } from '../../Witnesses/index.ts'

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

export const isLocationTimeRangeQuery = (query: Record<string, unknown>): query is LocationTimeRangeQuery => {
  return query && query?.schema === LocationTimeRangeAnswerSchema
}
