import { IsObjectFactory, TypeCheck } from '@xylabs/object'
import { ObjectTypeShape } from '@xylabs/typeof'

import { isModule } from '../module/index.ts'
import { ModuleInstance } from './Instance.ts'

export const requiredModuleInstanceFunctions: ObjectTypeShape = {
  manifest: 'function',
  state: 'function',
}

// we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<ModuleInstance>()

export const isModuleInstance: TypeCheck<ModuleInstance> = factory.create(requiredModuleInstanceFunctions, [isModule])
