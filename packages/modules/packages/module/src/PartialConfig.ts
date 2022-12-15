import { AbstractModuleConfig } from './Config'

export type PartialModuleConfig<T extends AbstractModuleConfig> = Omit<T, 'schema'> & {
  schema?: T['schema']
}
