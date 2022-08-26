import { XyoWitnessConfig } from './XyoWitnessConfig'

export type PartialWitnessConfig<T extends XyoWitnessConfig> = Omit<T, 'schema' | 'targetSchema'> & {
  schema?: T['schema']
  targetSchema?: T['targetSchema']
}
