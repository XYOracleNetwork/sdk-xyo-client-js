import { EmptyObject } from '@xylabs/object'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import { ArchivistConfig } from './Config.js'

export type ArchivistParams<
  TConfig extends AnyConfigSchema<ArchivistConfig> = AnyConfigSchema<ArchivistConfig>,
  TAdditionalParams extends EmptyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>
