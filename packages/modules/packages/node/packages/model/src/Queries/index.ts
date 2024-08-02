import { ModuleQueries } from '@xyo-network/module-model'

import { NodeAttachQuery } from './Attach.ts'
import { NodeAttachedQuery } from './Attached.ts'
import { NodeCertifyQuery } from './Certify.ts'
import { NodeDetachQuery } from './Detach.ts'
import { NodeRegisteredQuery } from './Registered.ts'

export * from './Attach.ts'
export * from './Attached.ts'
export * from './Certify.ts'
export * from './Detach.ts'
export * from './Registered.ts'

export type NodeQueries = NodeAttachQuery | NodeCertifyQuery | NodeDetachQuery | NodeAttachedQuery | NodeRegisteredQuery
export type NodeModuleQueries = ModuleQueries | NodeQueries
