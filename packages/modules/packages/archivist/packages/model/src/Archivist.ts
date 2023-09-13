import { AnyConfigSchema, Module, ModuleEventData, ModuleParams, ModuleQueryFunctions } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable, PromisableArray } from '@xyo-network/promise'

import { ArchivistConfig } from './Config'
import { ClearedEventData, DeletedEventData, InsertedEventData } from './Events'

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

export interface Archivist<TReadResponse = Payload, TWriteResponse = Payload, TWrite = TReadResponse, TId = string>
  extends ReadArchivist<TReadResponse, TId>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>,
    StashArchivist<TWriteResponse> {}

export interface ArchivistModuleEventData extends InsertedEventData, DeletedEventData, ClearedEventData, ModuleEventData {}

export type ArchivistQueryFunctions<TReadResponse = Payload, TWriteResponse = Payload, TWrite = TReadResponse, TId = string> = Archivist<
  TReadResponse,
  TWriteResponse,
  TWrite,
  TId
> &
  ModuleQueryFunctions

export type ArchivistModule<
  TParams extends ModuleParams<AnyConfigSchema<ArchivistConfig>> = ModuleParams<AnyConfigSchema<ArchivistConfig>>,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> = Module<TParams, TEventData>
