import { LocationHeatmapQuerySchema } from './LocationHeatmapQuery/index.js'
import { LocationQuadkeyHeatmapQuerySchema } from './LocationQuadkeyHeatmapQuery/index.js'
import { LocationTimeRangeQuerySchema } from './LocationTimeRangeQuery/index.js'

export type LocationQuerySchema = LocationQuadkeyHeatmapQuerySchema | LocationHeatmapQuerySchema | LocationTimeRangeQuerySchema

const locationQuerySchemas: Record<LocationQuerySchema, true> = {
  'network.xyo.location.heatmap.quadkey.query': true,
  'network.xyo.location.heatmap.query': true,
  'network.xyo.location.range.query': true,
}

export const isSupportedLocationQuerySchema = (schema: string): schema is LocationQuerySchema => {
  return locationQuerySchemas[schema as LocationQuerySchema] || false
}
