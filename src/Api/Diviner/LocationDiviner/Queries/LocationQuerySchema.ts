import { LocationHeatmapQuerySchema } from './LocationHeatmapQuery'
import { LocationQuadkeyHeatmapQuerySchema } from './LocationQuadkeyHeatmapQuery'
import { LocationTimeRangeQuerySchema } from './LocationTimeRangeQuery'

export type LocationQuerySchema =
  | LocationQuadkeyHeatmapQuerySchema
  | LocationHeatmapQuerySchema
  | LocationTimeRangeQuerySchema

const locationQuerySchemas: Record<LocationQuerySchema, true> = {
  'network.xyo.location.heatmap.quadkey.query': true,
  'network.xyo.location.heatmap.query': true,
  'network.xyo.location.range.query': true,
}

export const isSupportedLocationQuerySchema = (schema: string): schema is LocationQuerySchema => {
  return locationQuerySchemas[schema as LocationQuerySchema] || false
}
