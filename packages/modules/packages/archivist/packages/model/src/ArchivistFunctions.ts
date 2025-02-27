import type { Promisable, PromisableArray } from '@xylabs/promise'

import type { NextOptions } from './NextOptions.ts'

export interface AllArchivistFunctions<TReadResponse> {
  all(): PromisableArray<TReadResponse>
}

export interface ReadArchivistFunctions<TReadResponse, TId = string> {
  get(ids: TId[]): PromisableArray<TReadResponse>
  next(options?: NextOptions<TId>): PromisableArray<TReadResponse>
}

export interface WriteArchivistFunctions<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TId = string> {
  clear(): Promisable<void>
  delete(ids: TId[]): PromisableArray<TId>
  insert(item: TWrite[]): PromisableArray<TWriteResponse>
}

export interface StashArchivistFunctions<TWriteResponse> {
  commit(): PromisableArray<TWriteResponse>
}
