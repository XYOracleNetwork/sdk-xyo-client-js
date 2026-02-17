import type { TypeCheck } from '@xylabs/sdk-js'
import { AsObjectFactory } from '@xylabs/sdk-js'
import {
  // eslint-disable-next-line sonarjs/deprecation
  IsInstanceFactory, isModuleInstance, IsQueryableModuleFactory, WithFactory,
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

export const isNodeModule: TypeCheck<NodeModule> = new IsQueryableModuleFactory<NodeModule>().create([NodeAttachedQuerySchema])

export const asNodeModule = AsObjectFactory.create(isNodeModule)
export const asNodeInstance = AsObjectFactory.create(isNodeInstance)

/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withNodeModule = WithFactory.create(isNodeModule)
/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withNodeInstance = WithFactory.create(isNodeInstance)
