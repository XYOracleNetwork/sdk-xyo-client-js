import { ModuleQuery, ModuleQueryBase, Query } from '@xyo-network/module-model'

import { XyoNodeAttachQuery } from './Attach'
import { XyoNodeAttachedQuery } from './Attached'
import { XyoNodeDetachQuery } from './Detach'
import { XyoNodeRegisteredQuery } from './Registered'

export * from './Attach'
export * from './Attached'
export * from './Detach'
export * from './Registered'

export type XyoNodeQueryBase = XyoNodeAttachQuery | XyoNodeDetachQuery | XyoNodeAttachedQuery | XyoNodeRegisteredQuery
export type XyoNodeModuleQueries = ModuleQueryBase | XyoNodeQueryBase
export type XyoNodeQuery<T extends Query | void = void> = ModuleQuery<T extends Query ? XyoNodeQueryBase | T : XyoNodeQueryBase>
