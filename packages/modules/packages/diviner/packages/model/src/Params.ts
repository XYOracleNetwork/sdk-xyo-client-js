import type { EmptyObject } from '@xylabs/object'
import type { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import type { DivinerConfig } from './Config.ts'

export type DivinerParams<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
  TAdditional extends EmptyObject | void = void,
> = ModuleParams<TConfig, TAdditional>
