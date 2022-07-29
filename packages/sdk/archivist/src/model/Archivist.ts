export type Promisable<T> = Promise<T> | T
export type PromisableArray<T> = Promisable<T[]>
export type OptionalPromisable<T> = Promisable<T | undefined>
export type OptionalPromisableArray<T> = PromisableArray<T | undefined>
export type NullablePromisable<T> = Promisable<T | null>
export type NullablePromisableArray<T> = PromisableArray<T | null>

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
  TId = string
> extends ReadArchivist<TReadResponse, TId>,
    QueryArchivist<TReadResponse, TQueryResponse, TQuery>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>,
    StashArchivist<TReadResponse> {}
