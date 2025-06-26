import type { ApiConfig } from '@xyo-network/api-models'

import type { LocationHeatmapQuery, LocationHeatmapQuerySchema } from './LocationHeatmapQuery/index.ts'
import type { LocationQuadkeyHeatmapQuery, LocationQuadkeyHeatmapQuerySchema } from './LocationQuadkeyHeatmapQuery/index.ts'
import type { LocationQuerySchema } from './LocationQuerySchema.ts'
import type { LocationTimeRangeQuery, LocationTimeRangeQuerySchema } from './LocationTimeRangeQuery/index.ts'

export interface LocationQueryCreationRequest<
  TSchema extends LocationQuerySchema = LocationQuerySchema,
  TQuery extends Record<string, unknown> = Record<string, unknown>,
> {
  query: TQuery
  resultArchive: string
  resultArchivist: ApiConfig
  schema: TSchema
  sourceArchive: string
  sourceArchivist: ApiConfig
}

export type LocationTimeRangeQueryCreationRequest = LocationQueryCreationRequest<LocationTimeRangeQuerySchema, LocationTimeRangeQuery>
export type LocationHeatmapQueryCreationRequest = LocationQueryCreationRequest<LocationHeatmapQuerySchema, LocationHeatmapQuery>

export type LocationQuadkeyHeatmapQueryCreationRequest = LocationQueryCreationRequest<LocationQuadkeyHeatmapQuerySchema, LocationQuadkeyHeatmapQuery>

export type SupportedLocationQueryCreationRequest
  = | LocationTimeRangeQueryCreationRequest
    | LocationHeatmapQueryCreationRequest
    | LocationQuadkeyHeatmapQueryCreationRequest
