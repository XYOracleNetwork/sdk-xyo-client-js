import { AsObjectFactory } from '@xylabs/object'
import { IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'

import { NodeInstance } from './instance.ts'
import { NodeModule } from './Node.ts'
import { NodeAttachedQuerySchema } from './Queries/index.ts'

const instanceFactory = new IsInstanceFactory<NodeInstance>()

export const isNodeInstance = instanceFactory.create(
  {
    attach: 'function',
    attached: 'function',
    certify: 'function',
    detach: 'function',
    registered: 'function',
  },
  [isModuleInstance],
)

const moduleFactory = new IsModuleFactory<NodeModule>()

export const isNodeModule = moduleFactory.create([NodeAttachedQuerySchema])

export const asNodeModule = AsObjectFactory.create(isNodeModule)
export const asNodeInstance = AsObjectFactory.create(isNodeInstance)
export const withNodeModule = WithFactory.create(isNodeModule)
export const withNodeInstance = WithFactory.create(isNodeInstance)
