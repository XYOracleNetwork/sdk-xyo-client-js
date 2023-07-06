import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, ModuleEventData, ModuleInstance, ModuleParams } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promise'

import { ArchivistConfig } from './Config'
import { ClearedEventData, DeletedEventData, InsertedEventData } from './Events'

export interface ReadArchivist<TReadResponse, TId = string> {
  all?(): PromisableArray<TReadResponse>
  get(ids: TId[]): NullablePromisableArray<TReadResponse>
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

export interface Archivist<TReadResponse = Payload, TWriteResponse = BoundWitness, TWrite = TReadResponse, TId = string>
  extends ReadArchivist<TReadResponse, TId>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>,
    StashArchivist<TWriteResponse> {}

export interface ArchivistModuleEventData extends InsertedEventData, DeletedEventData, ClearedEventData, ModuleEventData {}

export type ArchivistModule<
  TParams extends ArchivistParams<AnyConfigSchema<ArchivistConfig>> = ArchivistParams<AnyConfigSchema<ArchivistConfig>>,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> = ModuleInstance<TParams, TEventData> & Archivist<Payload, Payload, Payload, string>

export type ArchivistInstance<TReadResponse = Payload, TWriteResponse = BoundWitness, TWrite = TReadResponse, TId = string> = Archivist<
  TReadResponse,
  TWriteResponse,
  TWrite,
  TId
>
