import type {
  AnyConfigSchema, ModuleInstanceParams, ModuleParams,
} from '@xyo-network/module-model'

import type { NodeConfig } from './Config.ts'

export interface NodeParams<
  TConfig extends AnyConfigSchema<NodeConfig> = AnyConfigSchema<NodeConfig>,
> extends ModuleParams<TConfig> {}

export interface NodeInstanceParams<
  TConfig extends AnyConfigSchema<NodeConfig> = AnyConfigSchema<NodeConfig>,
> extends ModuleInstanceParams<TConfig> {}
