import { Promisable, PromisableArray } from '@xylabs/promise'
import { AnyConfigSchema, Module, ModuleEventData, ModuleParams, ModuleQueryFunctions } from '@xyo-network/module-model'
import { Payload, WithMeta, WithOptionalMeta } from '@xyo-network/payload-model'

import { ArchivistConfig } from './Config'
import { ClearedEventData, DeletedEventData, InsertedEventData } from './EventModels'

export interface ReadArchivist<TReadResponse, TId = string> {
  all?(): PromisableArray<TReadResponse>
  get(ids: TId[]): PromisableArray<TReadResponse>
}

export interface WriteArchivist<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TId = string> {
  clear?(): Promisable<void>
  delete?(ids: TId[]): PromisableArray<TId>
  insert(item: TWrite[]): PromisableArray<TWriteResponse>
}

export interface StashArchivist<TWriteResponse> {
  commit?(): PromisableArray<TWriteResponse>
}

export interface Archivist<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = Payload,
  TWrite extends Payload = TReadResponse & Payload,
  TId = string,
> extends ReadArchivist<WithMeta<TReadResponse>, TId>,
    WriteArchivist<WithMeta<TReadResponse>, WithMeta<TWriteResponse>, TWrite, TId>,
    StashArchivist<WithMeta<TWriteResponse>> {}

export interface ArchivistModuleEventData extends InsertedEventData, DeletedEventData, ClearedEventData, ModuleEventData {}

export interface ArchivistQueryFunctions<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = Payload,
  TWrite extends Payload = TReadResponse & Payload,
  TId = string,
> extends Archivist<TReadResponse, TWriteResponse, TWrite, TId>,
    ModuleQueryFunctions {}

export interface ArchivistModule<
  TParams extends ModuleParams<AnyConfigSchema<ArchivistConfig>> = ModuleParams<AnyConfigSchema<ArchivistConfig>>,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends Module<TParams, TEventData> {}
