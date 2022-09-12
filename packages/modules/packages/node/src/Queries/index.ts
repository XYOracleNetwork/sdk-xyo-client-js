import { XyoNodeAttachQuery, XyoNodeAttachQuerySchema } from './Attach'
import { XyoNodeAttachedQuery, XyoNodeAttachedQuerySchema } from './Attached'
import { XyoNodeAvailableQuery, XyoNodeAvailableQuerySchema } from './Available'
import { XyoNodeDetatchQuery, XyoNodeDetatchQuerySchema } from './Detatch'

export * from './Attach'
export * from './Attached'
export * from './Available'
export * from './Detatch'

export type XyoNodeQuerySchema = XyoNodeAttachQuerySchema | XyoNodeDetatchQuerySchema | XyoNodeAttachedQuerySchema | XyoNodeAvailableQuerySchema

export type XyoNodeQuery = XyoNodeAttachQuery | XyoNodeDetatchQuery | XyoNodeAttachedQuery | XyoNodeAvailableQuery
