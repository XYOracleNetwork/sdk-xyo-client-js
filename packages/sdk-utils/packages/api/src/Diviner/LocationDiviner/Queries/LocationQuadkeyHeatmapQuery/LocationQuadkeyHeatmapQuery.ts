import { asSchema } from '@xyo-network/payload-model'

import type { LocationWitnessSchema } from '../../Witnesses/index.ts'

export const LocationQuadkeyHeatmapQuerySchema = asSchema('network.xyo.location.heatmap.quadkey.query', true)
export type LocationQuadkeyHeatmapQuerySchema = typeof LocationQuadkeyHeatmapQuerySchema

export const LocationQuadkeyHeatmapAnswerSchema = asSchema('network.xyo.location.heatmap.quadkey.answer', true)
export type LocationQuadkeyHeatmapAnswerSchema = typeof LocationQuadkeyHeatmapAnswerSchema

export type LocationQuadkeyHeatmapQuery = {
  schema: LocationWitnessSchema
  startTime?: string
  stopTime?: string
}

export const isLocationQuadkeyHeatmapQuery = (query: Record<string, unknown>): query is LocationQuadkeyHeatmapQuery => {
  return query && query?.schema === LocationQuadkeyHeatmapQuerySchema
}
