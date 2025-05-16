import type { Promisable, PromisableArray } from '@xylabs/promise'

import type { NextOptions } from './NextOptions.ts'

export interface AllArchivistFunctions<TReadResponse, TSnapshotResponse> {
  all(): PromisableArray<TReadResponse>
  snapshot(): PromisableArray<TSnapshotResponse>
}

export interface ReadArchivistFunctions<TReadResponse, TId = string> {
  get(ids: TId[]): PromisableArray<TReadResponse>
  next(options?: NextOptions<TId>): PromisableArray<TReadResponse>
}

export interface WriteArchivistFunctions<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TId = string> {
  clear(): Promisable<void>
  delete(ids: TId[]): PromisableArray<TReadResponse>
  insert(item: TWrite[]): PromisableArray<TWriteResponse>
}

export interface StashArchivistFunctions<TWriteResponse> {
  commit(): PromisableArray<TWriteResponse>
}
