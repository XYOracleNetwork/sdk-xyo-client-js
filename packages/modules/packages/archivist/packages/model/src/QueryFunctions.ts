import type { Hash } from '@xylabs/hex'
import type { Promisable, PromisableArray } from '@xylabs/promise'
import type { ModuleQueryFunctions } from '@xyo-network/module-model'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'

import type { NextOptions } from './NextOptions.ts'

export interface ReadArchivist<TReadResponse, TId = string> {
  all(): PromisableArray<TReadResponse>
  get(ids: TId[]): PromisableArray<TReadResponse>
  next(options?: NextOptions<TId>): PromisableArray<TReadResponse>
}

export interface WriteArchivist<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TId = string> {
  clear(): Promisable<void>
  delete(ids: TId[]): PromisableArray<TId>
  insert(item: TWrite[]): PromisableArray<TWriteResponse>
}

export interface StashArchivist<TWriteResponse> {
  commit(): PromisableArray<TWriteResponse>
}

export interface Archivist<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = Payload,
  TWrite extends Payload = TReadResponse & Payload,
  TId = Hash,
> extends ReadArchivist<WithStorageMeta<TReadResponse>, TId>,
  WriteArchivist<WithStorageMeta<TReadResponse>, WithStorageMeta<TWriteResponse>, TWrite, TId>,
  StashArchivist<TWriteResponse> {}

export interface ArchivistQueryFunctions<
  TReadResponse extends Payload = Payload,
  TWriteResponse extends Payload = Payload,
  TWrite extends Payload = TReadResponse & Payload,
  TId = Hash,
> extends Archivist<TReadResponse, TWriteResponse, TWrite, TId>,
  ModuleQueryFunctions {}
