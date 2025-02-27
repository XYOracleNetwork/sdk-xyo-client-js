import type { EmptyObject } from '@xylabs/object'
import type { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import type { NodeConfig } from './Config.ts'

export type NodeParams<
  TConfig extends AnyConfigSchema<NodeConfig> = AnyConfigSchema<NodeConfig>,
  TAdditionalParams extends EmptyObject | void = void,
> = ModuleParams<TConfig, TAdditionalParams>
