import type { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import type { ArchivistConfig } from './Config.ts'
import type { ArchivistInstance } from './Instance.ts'

export interface ArchivistParentInstances {
  commit?: ArchivistInstance[]
  read?: ArchivistInstance[]
  write?: ArchivistInstance[]
}

export interface ArchivistParamFields {
  parents?: ArchivistParentInstances
}

export interface ArchivistParams<
  TConfig extends AnyConfigSchema<ArchivistConfig> = AnyConfigSchema<ArchivistConfig>,
> extends ModuleParams<TConfig>, ArchivistParamFields {}
