import { LocationWitnessPayloadSchema } from '../../Witnesses'

export type LocationTimeRangeQuerySchema = 'network.xyo.location.range.query'
export const locationTimeRangeQuerySchema = 'network.xyo.location.range.query'

export type LocationTimeRangeAnswerSchema = 'network.xyo.location.range.answer'
export const locationTimeRangeAnswerSchema = 'network.xyo.location.range.answer'

export type LocationTimeRangeQuery = {
  startTime?: string
  stopTime?: string
  schema: LocationWitnessPayloadSchema
  // TODO: Bounding rectangle, etc.
}

export const isLocationTimeRangeQuery = (query: Record<string, unknown>): query is LocationTimeRangeQuery => {
  return query && query?.schema === locationTimeRangeQuerySchema
}
