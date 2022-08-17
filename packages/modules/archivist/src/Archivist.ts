import { NullablePromisableArray, PromisableArray } from '@xyo-network/promisable'

export interface ReadArchivist<TReadResponse, TId = string> {
  get(ids: TId[]): NullablePromisableArray<TReadResponse>
  all?(): PromisableArray<TReadResponse>
}

export interface WriteArchivist<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TId = string> {
  insert(item: TWrite[]): PromisableArray<TWriteResponse>
  delete?(ids: TId[]): PromisableArray<boolean>
  clear?(): void
}

export interface FindArchivist<TReadResponse, TFindResponse = TReadResponse, TFindFilter = unknown> {
  find(filter: TFindFilter): PromisableArray<TFindResponse>
}

export interface StashArchivist<TReadResponse> {
  commit?(): PromisableArray<TReadResponse>
}

export interface Archivist<
  TReadResponse,
  TWriteResponse = TReadResponse,
  TWrite = TReadResponse,
  TFindResponse = TReadResponse,
  TFindFilter = unknown,
  TId = string,
> extends ReadArchivist<TReadResponse, TId>,
    FindArchivist<TReadResponse, TFindResponse, TFindFilter>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>,
    StashArchivist<TReadResponse> {}
