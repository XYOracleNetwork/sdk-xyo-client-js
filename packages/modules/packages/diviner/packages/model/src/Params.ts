import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import { AnyObject } from '@xyo-network/object'

import { DivinerConfig } from './Config'

export type DivinerParams<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
  TAdditional extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditional>
