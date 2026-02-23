import type { AnyConfigSchema, QueryableModuleParams } from '@xyo-network/module-model'

import type { SentinelConfig } from './Config.ts'

export interface SentinelParams<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
> extends QueryableModuleParams<TConfig> {

}
