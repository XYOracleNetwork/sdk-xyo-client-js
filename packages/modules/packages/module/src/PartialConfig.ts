import { XyoModuleConfig } from './Config'

export type PartialModuleConfig<T extends XyoModuleConfig> = Omit<T, 'schema'> & {
  schema?: T['schema']
}
