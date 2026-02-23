import type { AnyConfigSchema, QueryableModuleParams } from '@xyo-network/module-model'

import type { DivinerConfig } from './Config.ts'

export interface DivinerParams<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
> extends QueryableModuleParams<TConfig> {}
