import { ModuleQuery, ModuleQueryBase } from '@xyo-network/module-model'
import { Query } from '@xyo-network/payload-model'

import { NodeAttachQuery } from './Attach'
import { NodeAttachedQuery } from './Attached'
import { NodeDetachQuery } from './Detach'
import { NodeRegisteredQuery } from './Registered'

export * from './Attach'
export * from './Attached'
export * from './Detach'
export * from './Registered'

export type NodeQueryBase = NodeAttachQuery | NodeDetachQuery | NodeAttachedQuery | NodeRegisteredQuery
export type NodeModuleQueries = ModuleQueryBase | NodeQueryBase
export type NodeQuery<T extends Query | void = void> = ModuleQuery<T extends Query ? NodeQueryBase | T : NodeQueryBase>
