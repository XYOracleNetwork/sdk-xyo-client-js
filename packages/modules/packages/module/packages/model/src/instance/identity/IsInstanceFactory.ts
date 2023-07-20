import { IsObjectFactory, ObjectTypeCheck } from '../../identity'
import { ModuleInstance } from '../ModuleInstance'

export type InstanceTypeCheck<T extends ModuleInstance = ModuleInstance> = ObjectTypeCheck<T>

export class IsInstanceFactory<T extends ModuleInstance = ModuleInstance> extends IsObjectFactory<T> {}
