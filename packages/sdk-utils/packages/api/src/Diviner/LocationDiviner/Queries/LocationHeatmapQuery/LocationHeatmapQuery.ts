import type { LocationWitnessSchema } from '../../Witnesses/index.ts'

export const LocationHeatmapQuerySchema = 'network.xyo.location.heatmap.query' as const
export type LocationHeatmapQuerySchema = typeof LocationHeatmapQuerySchema

export const LocationHeatmapAnswerSchema = 'network.xyo.location.heatmap.answer' as const
export type LocationHeatmapAnswerSchema = typeof LocationHeatmapAnswerSchema

export type LocationHeatmapQuery = {
  schema: LocationWitnessSchema
  startTime?: string
  stopTime?: string
}

export const isLocationHeatmapQuery = (query: Record<string, unknown>): query is LocationHeatmapQuery => {
  return query && query?.schema === LocationHeatmapQuerySchema
}
