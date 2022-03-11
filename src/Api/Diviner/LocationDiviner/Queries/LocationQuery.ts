import { XyoArchivistApiConfig } from '../../../Archivist'
import { LocationHeatmapQuery } from './LocationHeatmapQuery'
import { LocationQuerySchema } from './LocationQuerySchema'
import { LocationTimeRangeQuery } from './LocationTimeRangeQuery'

export type LocationQuery = LocationTimeRangeQuery | LocationHeatmapQuery

export interface LocationQueryCreationRequest<T extends LocationQuery = LocationQuery> {
  sourceArchive: XyoArchivistApiConfig
  resultArchive: XyoArchivistApiConfig
  schema: LocationQuerySchema
  query: T
}

export interface LocationQueryCreationResponse extends LocationQueryCreationRequest {
  hash: string
}
