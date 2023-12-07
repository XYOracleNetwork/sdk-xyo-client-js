import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import { EmptyObject } from '@xyo-network/object'

import { NodeConfig } from './Config'

export type NodeParams<
  TConfig extends AnyConfigSchema<NodeConfig> = AnyConfigSchema<NodeConfig>,
  TAdditionalParams extends EmptyObject | void = void,
> = ModuleParams<TConfig, TAdditionalParams>
