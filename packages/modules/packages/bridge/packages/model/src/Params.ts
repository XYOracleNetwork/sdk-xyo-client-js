import { AnyConfigSchema, ModuleParams, ModuleResolverInstance } from '@xyo-network/module-model'

import { BridgeConfig } from './Config'

export interface BridgeParams<TConfig extends AnyConfigSchema<BridgeConfig> = AnyConfigSchema<BridgeConfig>>
  extends ModuleParams<TConfig>,
    ModuleParams<TConfig> {
  resolver?: ModuleResolverInstance
}
