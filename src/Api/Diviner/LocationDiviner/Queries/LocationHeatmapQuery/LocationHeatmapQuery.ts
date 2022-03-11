import { LocationWitnessPayloadSchema } from '../../Witnesses'

export const locationHeatmapQuerySchema = 'network.xyo.location.heatmap.query'
export type LocationHeatmapQuerySchema = 'network.xyo.location.heatmap.query'

export const locationHeatmapAnswerSchema = 'network.xyo.location.heatmap.answer'
export type LocationHeatmapAnswerSchema = 'network.xyo.location.heatmap.answer'

export interface LocationHeatmapQuery {
  startTime?: string
  stopTime?: string
  schema: LocationWitnessPayloadSchema
}
