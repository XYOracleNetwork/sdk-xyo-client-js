import { ModuleInstance } from '../instance'
import { CreatableModule } from './CreatableModule'

export type CreatableModuleFactory<T extends ModuleInstance = ModuleInstance> = Omit<Omit<CreatableModule<T>, 'new'>, 'create'> & {
  create<T extends ModuleInstance>(this: CreatableModuleFactory<T>, params?: T['params']): Promise<T>
}
