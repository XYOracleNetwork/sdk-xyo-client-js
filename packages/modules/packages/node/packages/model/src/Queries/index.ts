import { ModuleQueries } from '@xyo-network/module-model'

import { NodeAttachQuery } from './Attach'
import { NodeAttachedQuery } from './Attached'
import { NodeCertifyQuery } from './Certify'
import { NodeDetachQuery } from './Detach'
import { NodeRegisteredQuery } from './Registered'

export * from './Attach'
export * from './Attached'
export * from './Certify'
export * from './Detach'
export * from './Registered'

export type NodeQueries = NodeAttachQuery | NodeCertifyQuery | NodeDetachQuery | NodeAttachedQuery | NodeRegisteredQuery
export type NodeModuleQueries = ModuleQueries | NodeQueries
