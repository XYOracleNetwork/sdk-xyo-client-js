import type { TypeCheck } from '@xylabs/object'
import { IsObjectFactory } from '@xylabs/object'
import type { ObjectTypeShape } from '@xylabs/typeof'

import { isModule } from '../module/index.ts'
import type { ModuleInstance } from './Instance.ts'

export const requiredModuleInstanceFunctions: ObjectTypeShape = {
  manifest: 'function',
  state: 'function',
}

// we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<ModuleInstance>()

export const isModuleInstance: TypeCheck<ModuleInstance> = factory.create(requiredModuleInstanceFunctions, [isModule])
