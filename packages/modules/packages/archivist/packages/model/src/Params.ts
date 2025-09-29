import type { Hash } from '@xylabs/hex'
import type { Promisable } from '@xylabs/promise'
import type { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { ArchivistConfig } from './Config.ts'
import type { ArchivistInstance } from './Instance.ts'

export interface ArchivistParentInstances {
  commit?: ArchivistInstance[]
  read?: ArchivistInstance[]
  write?: ArchivistInstance[]
}

export interface ArchivistKeyParams<TKey extends string = Hash, TValue = Payload, TDataKey extends string = TKey> {
  dataKey?: (value: TValue) => Promisable<TKey>
  key?: (value: TValue) => Promisable<TDataKey>
}

export interface ArchivistValueParams<TValue = Payload, TDataValue = TValue> {
  dataValue?: (value: TValue) => Promisable<TDataValue>
}

export interface ArchivistParamFields {
  keys?: ArchivistKeyParams
  parents?: ArchivistParentInstances
  values?: ArchivistValueParams
}

export interface ArchivistParams<
  TConfig extends AnyConfigSchema<ArchivistConfig> = AnyConfigSchema<ArchivistConfig>,
> extends ModuleParams<TConfig>, ArchivistParamFields {}
