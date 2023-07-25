import { IsObjectFactory, ObjectTypeCheck, ObjectTypeShape } from '@xyo-network/object-identity'

import { isModule } from '../module'
import { ModuleInstance } from './ModuleInstance'

export const requiredModuleInstanceFunctions: ObjectTypeShape = {
  describe: 'function',
  discover: 'function',
  manifest: 'function',
  moduleAddress: 'function',
}

//we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<ModuleInstance>()

export const isModuleInstance: ObjectTypeCheck<ModuleInstance> = factory.create(requiredModuleInstanceFunctions, [isModule])
