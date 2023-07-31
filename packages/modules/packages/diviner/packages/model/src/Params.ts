import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import { DivinerConfig } from './Config'

export type DivinerParams<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
  TAdditional extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditional>
