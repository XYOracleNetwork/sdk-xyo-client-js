import type { LocationHeatmapQuerySchema } from './LocationHeatmapQuery/index.ts'
import type { LocationQuadkeyHeatmapQuerySchema } from './LocationQuadkeyHeatmapQuery/index.ts'
import type { LocationTimeRangeQuerySchema } from './LocationTimeRangeQuery/index.ts'

export type LocationQuerySchema = LocationQuadkeyHeatmapQuerySchema | LocationHeatmapQuerySchema | LocationTimeRangeQuerySchema

const locationQuerySchemas: Record<LocationQuerySchema, true> = {
  'network.xyo.location.heatmap.quadkey.query': true,
  'network.xyo.location.heatmap.query': true,
  'network.xyo.location.range.query': true,
}

export const isSupportedLocationQuerySchema = (schema: string): schema is LocationQuerySchema => {
  return locationQuerySchemas[schema as LocationQuerySchema] || false
}
