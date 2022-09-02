import { XyoArchivistConfig } from './Config'

export type PartialArchivistConfig<T extends XyoArchivistConfig> = Omit<T, 'schema'> & {
  schema?: T['schema']
}
