import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import { EmptyObject } from '@xyo-network/object'

import { ArchivistConfig } from './Config'

export type ArchivistParams<
  TConfig extends AnyConfigSchema<ArchivistConfig> = AnyConfigSchema<ArchivistConfig>,
  TAdditionalParams extends EmptyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>
