import type {
  AnyConfigSchema, ModuleResolverInstance,
  QueryableModuleParams,
} from '@xyo-network/module-model'

import type { BridgeConfig } from './Config.ts'

export interface BridgeParams<TConfig extends AnyConfigSchema<BridgeConfig> = AnyConfigSchema<BridgeConfig>>
  extends QueryableModuleParams<TConfig>,
  QueryableModuleParams<TConfig> {
  resolver?: ModuleResolverInstance
}
