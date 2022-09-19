import { XyoModuleQuery, XyoModuleQuerySchema, XyoQuery } from '@xyo-network/module'

import { XyoNodeAttachQuery, XyoNodeAttachQuerySchema } from './Attach'
import { XyoNodeAttachedQuery, XyoNodeAttachedQuerySchema } from './Attached'
import { XyoNodeDetatchQuery, XyoNodeDetatchQuerySchema } from './Detatch'
import { XyoNodeRegisteredQuery, XyoNodeRegisteredQuerySchema } from './Registered'

export * from './Attach'
export * from './Attached'
export * from './Detatch'
export * from './Registered'

type XyoNodeQuerySchemaBase =
  | XyoNodeAttachQuerySchema
  | XyoNodeDetatchQuerySchema
  | XyoNodeAttachedQuerySchema
  | XyoNodeRegisteredQuerySchema
  | XyoModuleQuerySchema

export type XyoNodeQuerySchema<T extends string | void = void> = T extends string ? XyoNodeQuerySchemaBase | T : XyoNodeQuerySchemaBase

type XyoNodeQueryBase = XyoNodeAttachQuery | XyoNodeDetatchQuery | XyoNodeAttachedQuery | XyoNodeRegisteredQuery | XyoModuleQuery

export type XyoNodeQuery<T extends XyoQuery | void = void> = T extends XyoQuery ? XyoNodeQueryBase | T : XyoNodeQueryBase
