import type {
  EventEmitter, Hash, Promisable,
} from '@xylabs/sdk-js'
import type {
  AnyConfigSchema, ModuleInstance, QueryableModuleParams,
} from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { ArchivistConfig } from './Config.ts'
import type { ArchivistModuleEventData } from './EventData.ts'
import type { ArchivistModule } from './Module.ts'
import type { ArchivistModuleInstance } from './ModuleInstance.ts'
import type { ArchivistRawQueryFunctions } from './RawQueryFunctions.ts'

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
> extends QueryableModuleParams<TConfig>, ArchivistParamFields {}

export interface ArchivistInstance<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  TPayload extends Payload = Payload,
> extends ArchivistModuleInstance<TParams, TEventData>,
  ArchivistModule<TPayload, TPayload>,
  ModuleInstance<TParams, TEventData>,
  ArchivistRawQueryFunctions, EventEmitter<TEventData> {}
