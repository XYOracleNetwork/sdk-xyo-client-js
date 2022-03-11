import { XyoArchivistApiConfig } from '../../../Archivist'
import { LocationHeatmapQuery } from './LocationHeatmapQuery'
import { LocationQuerySchema } from './LocationQuerySchema'
import { LocationTimeRangeQuery } from './LocationTimeRangeQuery'

export type LocationQuery = LocationTimeRangeQuery | LocationHeatmapQuery

// export abstract class AbstractLocationQueryCreationRequest {
//   public abstract schema: LocationQuerySchema
//   public abstract query: LocationQuery
// }

// export interface LocationQueryCreationRequest extends AbstractLocationQueryCreationRequest {
//   sourceArchive: XyoArchivistApiConfig
//   resultArchive: XyoArchivistApiConfig
// }

export interface LocationQueryCreationRequest {
  sourceArchive: XyoArchivistApiConfig
  resultArchive: XyoArchivistApiConfig
  schema: LocationQuerySchema
  query: LocationQuery
}

export interface LocationQueryCreationResponse extends LocationQueryCreationRequest {
  hash: string
}
