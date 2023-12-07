import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import { EmptyObject } from '@xyo-network/object'

import { DivinerConfig } from './Config'

export type DivinerParams<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
  TAdditional extends EmptyObject | void = void,
> = ModuleParams<TConfig, TAdditional>
