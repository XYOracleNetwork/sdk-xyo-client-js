import type { EmptyObject } from '@xylabs/object'
import type { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import type { ArchivistConfig } from './Config.ts'

export type ArchivistParams<
  TConfig extends AnyConfigSchema<ArchivistConfig> = AnyConfigSchema<ArchivistConfig>,
  TAdditionalParams extends EmptyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>
