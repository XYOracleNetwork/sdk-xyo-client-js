import { ApiConfig } from '@xyo-network/api-models'

import { LocationHeatmapQuery, LocationHeatmapQuerySchema } from './LocationHeatmapQuery/index.js'
import { LocationQuadkeyHeatmapQuery, LocationQuadkeyHeatmapQuerySchema } from './LocationQuadkeyHeatmapQuery/index.js'
import { LocationQuerySchema } from './LocationQuerySchema.js'
import { LocationTimeRangeQuery, LocationTimeRangeQuerySchema } from './LocationTimeRangeQuery/index.js'

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

export type SupportedLocationQueryCreationRequest =
  | LocationTimeRangeQueryCreationRequest
  | LocationHeatmapQueryCreationRequest
  | LocationQuadkeyHeatmapQueryCreationRequest
