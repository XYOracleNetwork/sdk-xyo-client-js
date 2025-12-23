import type { Promisable, PromisableArray } from '@xylabs/sdk-js'

import type { NextOptions } from './NextOptions.ts'

export interface AllArchivistFunctions<TReadResponse, TSnapshotResponse> {
  /** @deprecated use next or snapshot instead */
  all(): PromisableArray<TReadResponse>
  snapshot(): PromisableArray<TSnapshotResponse>
}

export interface ReadArchivistFunctions<TReadResponse, TId = string, TCursor = TId> {
  get(ids: TId[]): PromisableArray<TReadResponse>
  next(options?: NextOptions<TCursor>): PromisableArray<TReadResponse>
}

export interface WriteArchivistFunctions<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TId = string> {
  clear(): Promisable<void>
  delete(ids: TId[]): PromisableArray<TReadResponse>
  insert(item: TWrite[]): PromisableArray<TWriteResponse>
}

export interface StashArchivistFunctions<TWriteResponse> {
  commit(): PromisableArray<TWriteResponse>
}
