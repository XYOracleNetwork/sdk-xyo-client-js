import { LocationWitnessPayloadSchema } from '../../Witnesses'

export type LocationQuadkeyHeatmapQuerySchema = 'network.xyo.location.heatmap.quadkey.query'
export const locationQuadkeyHeatmapQuerySchema: LocationQuadkeyHeatmapQuerySchema =
  'network.xyo.location.heatmap.quadkey.query'
export type LocationQuadkeyHeatmapAnswerSchema = 'network.xyo.location.heatmap.quadkey.answer'
export const locationQuadkeyHeatmapAnswerSchema: LocationQuadkeyHeatmapAnswerSchema =
  'network.xyo.location.heatmap.quadkey.answer'
export type LocationQuadkeyHeatmapQuery = {
  startTime?: string
  stopTime?: string
  schema: LocationWitnessPayloadSchema
}

export const isLocationQuadkeyHeatmapQuery = (query: Record<string, unknown>): query is LocationQuadkeyHeatmapQuery => {
  return query && query?.schema === locationQuadkeyHeatmapQuerySchema
}
