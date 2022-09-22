import { XyoModuleQuery, XyoQuery } from '@xyo-network/module'

import { XyoNodeAttachQuery } from './Attach'
import { XyoNodeAttachedQuery } from './Attached'
import { XyoNodeDetachQuery } from './Detach'
import { XyoNodeRegisteredQuery } from './Registered'

export * from './Attach'
export * from './Attached'
export * from './Detach'
export * from './Registered'

export type XyoNodeQueryBase = XyoNodeAttachQuery | XyoNodeDetachQuery | XyoNodeAttachedQuery | XyoNodeRegisteredQuery

export type XyoNodeQuery<T extends XyoQuery | void = void> = XyoModuleQuery<T extends XyoQuery ? XyoNodeQueryBase | T : XyoNodeQueryBase>
