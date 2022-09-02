import { XyoWitnessConfig } from './Config'

export type PartialWitnessConfig<T extends XyoWitnessConfig> = Omit<T, 'schema' | 'targetSchema'> & {
  schema?: T['schema']
  targetSchema?: T['targetSchema']
}
