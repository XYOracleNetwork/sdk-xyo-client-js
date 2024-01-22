import { EmptyObject } from '@xylabs/object'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import { DivinerConfig } from './Config'

export type DivinerParams<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
  TAdditional extends EmptyObject | void = void,
> = ModuleParams<TConfig, TAdditional>
