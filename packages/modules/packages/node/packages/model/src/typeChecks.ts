import { AsFactory, IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'

import { NodeInstance, NodeModule } from './Node'
import { NodeAttachedQuerySchema, NodeAttachQuerySchema, NodeDetachQuerySchema, NodeRegisteredQuerySchema } from './Queries'

export const isNodeInstance = IsInstanceFactory.create<NodeInstance>(
  {
    attach: 'function',
    attached: 'function',
    detach: 'function',
    registered: 'function',
  },
  isModuleInstance,
)
export const isNodeModule = IsModuleFactory.create<NodeModule>([
  NodeAttachedQuerySchema,
  NodeAttachQuerySchema,
  NodeDetachQuerySchema,
  NodeRegisteredQuerySchema,
])

export const asNodeModule = AsFactory.create(isNodeModule)
export const asNodeInstance = AsFactory.create(isNodeInstance)
export const withNodeModule = WithFactory.create(isNodeModule)
export const withNodeInstance = WithFactory.create(isNodeInstance)
