import { LocationHeatmapQuerySchema } from './LocationHeatmapQuery'
import { LocationTimeRangeQuerySchema } from './LocationTimeRangeQuery'

export type LocationQuerySchema = LocationHeatmapQuerySchema | LocationTimeRangeQuerySchema

const locationQuerySchemas: Record<LocationQuerySchema, true> = {
  'network.xyo.location.heatmap.query': true,
  'network.xyo.location.range.query': true,
}

export const isSupportedLocationQuerySchema = (schema: string): boolean => {
  return locationQuerySchemas[schema as LocationQuerySchema] || false
}
