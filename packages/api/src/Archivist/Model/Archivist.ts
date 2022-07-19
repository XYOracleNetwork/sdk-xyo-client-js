export interface QueryableArchivist<TQueryResponse, TQuery> {
  find(query: TQuery): Promise<TQueryResponse> | TQueryResponse
}
export interface ReadArchivist<TReadResponse, TId = string> {
  get(id: TId): Promise<TReadResponse | undefined> | TReadResponse | undefined
}

export interface WriteArchivist<TWriteResponse, TWrite, TId = string> {
  insert(item: TWrite): Promise<TWriteResponse> | TWriteResponse
  delete?(id: TId): Promise<boolean> | boolean
  clear?(): void
}

export type ReadWriteArchivist<TWriteResponse, TWrite, TReadResponse = TWriteResponse, TId = string> = ReadArchivist<TReadResponse, TId> & WriteArchivist<TWriteResponse, TWrite>

export type Archivist<TWriteResponse, TWrite, TReadResponse = TWriteResponse, TId = string, TQueryResponse = unknown, TQuery = unknown> = ReadWriteArchivist<
  TWriteResponse,
  TWrite,
  TReadResponse,
  TId
> &
  QueryableArchivist<TQueryResponse, TQuery>
