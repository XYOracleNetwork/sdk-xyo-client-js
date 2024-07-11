import { EmptyObject } from '@xylabs/object'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import { NodeConfig } from './Config.js'

export type NodeParams<
  TConfig extends AnyConfigSchema<NodeConfig> = AnyConfigSchema<NodeConfig>,
  TAdditionalParams extends EmptyObject | void = void,
> = ModuleParams<TConfig, TAdditionalParams>
