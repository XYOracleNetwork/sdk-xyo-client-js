import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { EventData } from '@xyo-network/module-events'
import { AnyConfigSchema, Module, ModuleConfig, ModuleParams } from '@xyo-network/module-model'
import { PayloadFindFilter, XyoPayload } from '@xyo-network/payload-model'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promise'

import { ArchivistConfig } from './Config'

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
  TEventData extends EventData | undefined = undefined,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TEventData, TAdditionalParams>

export interface Archivist<
  TReadResponse = XyoPayload,
  TWriteResponse = XyoBoundWitness,
  TWrite = TReadResponse,
  TFindResponse = TReadResponse,
  TFindFilter = PayloadFindFilter,
  TId = string,
> extends ReadArchivist<TReadResponse, TId>,
    FindArchivist<TReadResponse, TFindResponse, TFindFilter>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>,
    StashArchivist<TWriteResponse> {}

export type ArchivistModule<TParams extends ArchivistParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>> =
  Module<TParams> & Archivist<XyoPayload, XyoPayload, XyoPayload, XyoPayload, PayloadFindFilter, string>

/** @deprecated use ArchivistModule instead */
export type PayloadArchivist = ArchivistModule
