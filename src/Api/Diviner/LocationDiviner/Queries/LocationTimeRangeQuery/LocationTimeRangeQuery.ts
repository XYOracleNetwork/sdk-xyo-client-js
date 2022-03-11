import { LocationWitnessPayloadSchema } from '../../Witnesses'

export const locationTimeRangeQuerySchema = 'network.xyo.location.range.query'
export type LocationTimeRangeQuerySchema = 'network.xyo.location.range.query'

export const locationTimeRangeAnswerSchema = 'network.xyo.location.range.answer'
export type LocationTimeRangeAnswerSchema = 'network.xyo.location.range.answer'

export interface LocationTimeRangeQuery {
  startTime?: string
  stopTime?: string
  schema: LocationWitnessPayloadSchema
  // TODO: Bounding rectangle, etc.
}
