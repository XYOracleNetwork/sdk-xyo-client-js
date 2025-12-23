import type { TypeCheck } from '@xylabs/sdk-js'
import { AsObjectFactory } from '@xylabs/sdk-js'
import {
  IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory,
} from '@xyo-network/module-model'

import type { NodeInstance } from './instance.ts'
import type { NodeModule } from './Node.ts'
import { NodeAttachedQuerySchema } from './Queries/index.ts'

const instanceFactory = new IsInstanceFactory<NodeInstance>()

export const isNodeInstance: TypeCheck<NodeInstance> = instanceFactory.create(
  {
    attach: 'function',
    attached: 'function',
    certify: 'function',
    detach: 'function',
    registered: 'function',
  },
  [isModuleInstance],
)

export const isNodeModule: TypeCheck<NodeModule> = new IsModuleFactory<NodeModule>().create([NodeAttachedQuerySchema])

export const asNodeModule = AsObjectFactory.create(isNodeModule)
export const asNodeInstance = AsObjectFactory.create(isNodeInstance)
export const withNodeModule = WithFactory.create(isNodeModule)
export const withNodeInstance = WithFactory.create(isNodeInstance)
