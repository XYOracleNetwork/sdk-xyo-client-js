import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, Module, ModuleConfig, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { Payload, PayloadFindFilter } from '@xyo-network/payload-model'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promise'

import { ArchivistConfig } from './Config'
import { DeletedEventArgs, DeletedEventData, InsertedEventArgs, InsertedEventData } from './Events'

export interface ReadArchivist<TReadResponse, TId = string> {
  all?(): PromisableArray<TReadResponse>
  get(ids: TId[]): NullablePromisableArray<TReadResponse>
}

export interface WriteArchivist<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TId = string> {
  clear?(): Promisable<void>
  delete?(ids: TId[]): PromisableArray<boolean>
  insert(item: TWrite[]): PromisableArray<TWriteResponse>
}

export interface FindArchivist<TReadResponse, TFindResponse = TReadResponse, TFindFilter = unknown> {
  find(filter?: TFindFilter): PromisableArray<TFindResponse>
}

export interface StashArchivist<TWriteResponse> {
  commit?(): Promisable<TWriteResponse[]>
}

export type ArchivistParams<
  TConfig extends AnyConfigSchema<ArchivistConfig> = AnyConfigSchema<ArchivistConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>

export interface Archivist<
  TReadResponse = Payload,
  TWriteResponse = BoundWitness,
  TWrite = TReadResponse,
  TFindResponse = TReadResponse,
  TFindFilter = PayloadFindFilter,
  TId = string,
> extends ReadArchivist<TReadResponse, TId>,
    FindArchivist<TReadResponse, TFindResponse, TFindFilter>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>,
    StashArchivist<TWriteResponse> {}

export interface ArchivistModuleEventData extends InsertedEventData, DeletedEventData, ModuleEventData {}

export type ArchivistModule<
  TParams extends ArchivistParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> = Module<TParams, TEventData> & Archivist<Payload, Payload, Payload, Payload, PayloadFindFilter, string>

/** @deprecated use ArchivistModule instead */
export type PayloadArchivist = ArchivistModule
