import { XyoWitnessConfig } from './XyoWitnessConfig'

export type PartialWitnessConfig<T extends XyoWitnessConfig> = T & {
  account?: T['account']
  schema?: T['schema']
  targetSchema?: T['targetSchema']
}
