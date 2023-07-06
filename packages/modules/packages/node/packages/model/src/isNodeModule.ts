import { IsModuleFactory } from '@xyo-network/module'

import { NodeModule } from './Node'
import { NodeAttachedQuerySchema, NodeAttachQuerySchema, NodeDetachQuerySchema, NodeRegisteredQuerySchema } from './Queries'

export const isNodeModule = IsModuleFactory.create<NodeModule>([
  NodeAttachQuerySchema,
  NodeDetachQuerySchema,
  NodeRegisteredQuerySchema,
  NodeAttachedQuerySchema,
])
