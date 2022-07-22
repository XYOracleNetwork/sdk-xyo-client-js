export interface ReadArchivist<TReadResponse, TId = string> {
  get(ids: TId[]): Promise<(TReadResponse | null)[]> | (TReadResponse | null)[]
  all?(): Promise<TReadResponse[]> | TReadResponse[]
}

export interface WriteArchivist<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TId = string> {
  insert(item: TWrite[]): Promise<TWriteResponse[]> | TWriteResponse[]
  delete?(ids: TId[]): Promise<boolean[]> | boolean[]
  clear?(): void
}

export interface QueryArchivist<TReadResponse, TQueryResponse = TReadResponse, TQuery = unknown> {
  find(query: TQuery): Promise<TQueryResponse[]> | TQueryResponse[]
}

export interface StashArchivist {
  commit?(): void
}

export interface Archivist<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TQueryResponse = TReadResponse, TQuery = unknown, TId = string>
  extends ReadArchivist<TReadResponse, TId>,
    QueryArchivist<TReadResponse, TQueryResponse, TQuery>,
    WriteArchivist<TReadResponse, TWriteResponse, TWrite, TId>,
    StashArchivist {}
