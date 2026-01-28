import { asSchema } from '@xyo-network/payload-model'

import type { LocationWitnessSchema } from '../../Witnesses/index.ts'

export const LocationHeatmapQuerySchema = asSchema('network.xyo.location.heatmap.query', true)
export type LocationHeatmapQuerySchema = typeof LocationHeatmapQuerySchema

export const LocationHeatmapAnswerSchema = asSchema('network.xyo.location.heatmap.answer', true)
export type LocationHeatmapAnswerSchema = typeof LocationHeatmapAnswerSchema

export type LocationHeatmapQuery = {
  schema: LocationWitnessSchema
  startTime?: string
  stopTime?: string
}

export const isLocationHeatmapQuery = (query: Record<string, unknown>): query is LocationHeatmapQuery => {
  return query && query?.schema === LocationHeatmapQuerySchema
}
