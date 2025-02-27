import { LocationWitnessSchema } from '../../Witnesses/index.ts'

export const LocationQuadkeyHeatmapQuerySchema = 'network.xyo.location.heatmap.quadkey.query' as const
export type LocationQuadkeyHeatmapQuerySchema = typeof LocationQuadkeyHeatmapQuerySchema

export const LocationQuadkeyHeatmapAnswerSchema = 'network.xyo.location.heatmap.quadkey.answer' as const
export type LocationQuadkeyHeatmapAnswerSchema = typeof LocationQuadkeyHeatmapAnswerSchema

export type LocationQuadkeyHeatmapQuery = {
  schema: LocationWitnessSchema
  startTime?: string
  stopTime?: string
}

export const isLocationQuadkeyHeatmapQuery = (query: Record<string, unknown>): query is LocationQuadkeyHeatmapQuery => {
  return query && query?.schema === LocationQuadkeyHeatmapQuerySchema
}
