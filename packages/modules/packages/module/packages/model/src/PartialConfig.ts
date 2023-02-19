import { ModuleConfig } from './Config'

export type PartialModuleConfig<T extends ModuleConfig> = Omit<T, 'schema'> & {
  schema?: T['schema']
}
