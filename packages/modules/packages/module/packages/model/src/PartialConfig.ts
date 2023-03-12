import { ModuleConfig } from './model'

export type PartialModuleConfig<T extends ModuleConfig> = Omit<T, 'schema'> & {
  schema?: T['schema']
}
