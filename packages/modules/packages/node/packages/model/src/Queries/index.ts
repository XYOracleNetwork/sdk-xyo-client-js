import { ModuleQueries } from '@xyo-network/module-model'

import { NodeAttachQuery } from './Attach.js'
import { NodeAttachedQuery } from './Attached.js'
import { NodeCertifyQuery } from './Certify.js'
import { NodeDetachQuery } from './Detach.js'
import { NodeRegisteredQuery } from './Registered.js'

export * from './Attach.js'
export * from './Attached.js'
export * from './Certify.js'
export * from './Detach.js'
export * from './Registered.js'

export type NodeQueries = NodeAttachQuery | NodeCertifyQuery | NodeDetachQuery | NodeAttachedQuery | NodeRegisteredQuery
export type NodeModuleQueries = ModuleQueries | NodeQueries
