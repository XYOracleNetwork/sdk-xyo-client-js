import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import { NodeConfig } from './Config'

export type NodeParams<
  TConfig extends AnyConfigSchema<NodeConfig> = AnyConfigSchema<NodeConfig>,
  TAdditionalParams extends AnyObject | void = void,
> = ModuleParams<TConfig, TAdditionalParams>
