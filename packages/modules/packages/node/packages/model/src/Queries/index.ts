import type { ModuleQueries } from '@xyo-network/module-model'

import type { NodeAttachQuery } from './Attach.ts'
import type { NodeAttachedQuery } from './Attached.ts'
import type { NodeCertifyQuery } from './Certify.ts'
import type { NodeDetachQuery } from './Detach.ts'
import type { NodeRegisteredQuery } from './Registered.ts'

export * from './Attach.ts'
export * from './Attached.ts'
export * from './Certify.ts'
export * from './Detach.ts'
export * from './Registered.ts'

export type NodeQueries = NodeAttachQuery | NodeCertifyQuery | NodeDetachQuery | NodeAttachedQuery | NodeRegisteredQuery
export type NodeModuleQueries = ModuleQueries | NodeQueries
