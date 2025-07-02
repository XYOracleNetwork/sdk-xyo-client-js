import type { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import type { SentinelConfig } from './Config.ts'

export interface SentinelParams<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
> extends ModuleParams<TConfig> {

}
