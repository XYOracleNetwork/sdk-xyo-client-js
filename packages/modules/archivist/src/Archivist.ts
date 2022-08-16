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

export interface QueryArchivist<TReadResponse, TQueryResponse = TReadResponse, TQuery = unknown> {
  find(query: TQuery): PromisableArray<TQueryResponse>
}

export interface StashArchivist<TReadResponse> {
  commit?(): PromisableArray<TReadResponse>
}

export interface Archivist<
  TReadResponse,
  TWriteResponse = TReadResponse,
  TWrite = TReadResponse,
  TQueryResponse = TReadResponse,
  TQuery = unknown,
  TId = string,
> extends ReadArchivist<TReadResponse, TId>,
    QueryArchivist<TReadResponse, TQueryResponse, TQuery>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>,
    StashArchivist<TReadResponse> {}
