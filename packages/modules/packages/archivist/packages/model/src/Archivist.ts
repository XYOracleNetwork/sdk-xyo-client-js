import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, Module, ModuleEventData, ModuleInstance, ModuleParams, ModuleQueryFunctions } from '@xyo-network/module-model'
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
  delete?(ids: TId[]): PromisableArray<boolean>
  insert(item: TWrite[]): PromisableArray<TWriteResponse>
}

export interface StashArchivist<TWriteResponse> {
  commit?(): Promisable<TWriteResponse[]>
}

export type ArchivistParams<
  TConfig extends AnyConfigSchema<ArchivistConfig> = AnyConfigSchema<ArchivistConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>

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
  TEventData extends ModuleEventData = ModuleEventData,
> = Module<TParams, TEventData>

export type ArchivistInstance<
  TParams extends ModuleParams<AnyConfigSchema<ArchivistConfig>> = ModuleParams<AnyConfigSchema<ArchivistConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = ArchivistModule<TParams, TEventData> & ArchivistQueryFunctions & ModuleInstance
