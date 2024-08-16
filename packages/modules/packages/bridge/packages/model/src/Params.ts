import type { AnyConfigSchema, ModuleParams, ModuleResolverInstance } from '@xyo-network/module-model'

import type { BridgeConfig } from './Config.ts'

export interface BridgeParams<TConfig extends AnyConfigSchema<BridgeConfig> = AnyConfigSchema<BridgeConfig>>
  extends ModuleParams<TConfig>,
  ModuleParams<TConfig> {
  resolver?: ModuleResolverInstance
}
