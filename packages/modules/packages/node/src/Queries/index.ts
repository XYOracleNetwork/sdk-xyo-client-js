import { XyoModuleQuery, XyoModuleQuerySchema, XyoQuery } from '@xyo-network/module'

import { XyoNodeAttachQuery, XyoNodeAttachQuerySchema } from './Attach'
import { XyoNodeAttachedQuery, XyoNodeAttachedQuerySchema } from './Attached'
import { XyoNodeAvailableQuery, XyoNodeAvailableQuerySchema } from './Available'
import { XyoNodeDetatchQuery, XyoNodeDetatchQuerySchema } from './Detatch'

export * from './Attach'
export * from './Attached'
export * from './Available'
export * from './Detatch'

type XyoNodeQuerySchemaBase =
  | XyoNodeAttachQuerySchema
  | XyoNodeDetatchQuerySchema
  | XyoNodeAttachedQuerySchema
  | XyoNodeAvailableQuerySchema
  | XyoModuleQuerySchema

export type XyoNodeQuerySchema<T extends string | void = void> = T extends string ? XyoNodeQuerySchemaBase | T : XyoNodeQuerySchemaBase

type XyoNodeQueryBase = XyoNodeAttachQuery | XyoNodeDetatchQuery | XyoNodeAttachedQuery | XyoNodeAvailableQuery | XyoModuleQuery

export type XyoNodeQuery<T extends XyoQuery | void = void> = T extends XyoQuery ? XyoNodeQueryBase | T : XyoNodeQueryBase
