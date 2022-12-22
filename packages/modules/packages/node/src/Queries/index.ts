import { AbstractModuleQuery, XyoQuery } from '@xyo-network/module-model'

import { XyoNodeAttachQuery } from './Attach'
import { XyoNodeAttachedQuery } from './Attached'
import { XyoNodeDetachQuery } from './Detach'
import { XyoNodeRegisteredQuery } from './Registered'

export * from './Attach'
export * from './Attached'
export * from './Detach'
export * from './Registered'

export type XyoNodeQueryBase = XyoNodeAttachQuery | XyoNodeDetachQuery | XyoNodeAttachedQuery | XyoNodeRegisteredQuery

export type XyoNodeQuery<T extends XyoQuery | void = void> = AbstractModuleQuery<T extends XyoQuery ? XyoNodeQueryBase | T : XyoNodeQueryBase>
