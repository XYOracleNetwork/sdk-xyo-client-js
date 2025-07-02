import type { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import type { NodeConfig } from './Config.ts'

export interface NodeParams<
  TConfig extends AnyConfigSchema<NodeConfig> = AnyConfigSchema<NodeConfig>,
> extends ModuleParams<TConfig> {}
