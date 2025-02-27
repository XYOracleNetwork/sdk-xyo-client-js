import { EmptyObject, WithAdditional } from '@xylabs/object'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import { ArchivistConfig } from './Config.ts'
import { ArchivistInstance } from './Instance.ts'

export interface ArchivistParentInstances {
  commit?: ArchivistInstance[]
  read?: ArchivistInstance[]
  write?: ArchivistInstance[]
}

export interface ArchivistParamFields {
  parents?: ArchivistParentInstances
}

export type ArchivistParams<
  TConfig extends AnyConfigSchema<ArchivistConfig> = AnyConfigSchema<ArchivistConfig>,
  TAdditionalParams extends EmptyObject = EmptyObject,
> = ModuleParams<TConfig, WithAdditional<ArchivistParamFields & TAdditionalParams>>
