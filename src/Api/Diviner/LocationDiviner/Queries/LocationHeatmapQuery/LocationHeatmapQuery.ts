import { LocationWitnessPayloadSchema } from '../../Witnesses'

export type LocationHeatmapQuerySchema = 'network.xyo.location.heatmap.query'
export const locationHeatmapQuerySchema: LocationHeatmapQuerySchema = 'network.xyo.location.heatmap.query'

export type LocationHeatmapAnswerSchema = 'network.xyo.location.heatmap.answer'
export const locationHeatmapAnswerSchema: LocationHeatmapAnswerSchema = 'network.xyo.location.heatmap.answer'

export type LocationHeatmapQuery = {
  startTime?: string
  stopTime?: string
  schema: LocationWitnessPayloadSchema
}

export const isLocationHeatmapQuery = (query: Record<string, unknown>): query is LocationHeatmapQuery => {
  return query && query?.schema === locationHeatmapQuerySchema
}
