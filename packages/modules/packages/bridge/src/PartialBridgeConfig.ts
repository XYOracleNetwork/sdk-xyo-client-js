import { XyoBridgeConfig } from './Config'

export type PartialBridgeConfig<T extends XyoBridgeConfig> = Omit<T, 'schema'> & {
  schema?: T['schema']
}
