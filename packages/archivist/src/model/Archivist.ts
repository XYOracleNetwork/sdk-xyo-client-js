export interface Archivist<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TQueryResponse = TReadResponse, TQuery = unknown, TId = string> {
  get(ids: TId[]): Promise<(TReadResponse | null)[]> | (TReadResponse | null)[]
  all?(): Promise<TReadResponse[]> | TReadResponse[]
  find?(query: TQuery): Promise<TQueryResponse[]> | TQueryResponse[]
  insert?(item: TWrite[]): Promise<TWriteResponse[]> | TWriteResponse[]
  delete?(ids: TId[]): Promise<boolean[]> | boolean[]
  clear?(): void
  commit?(): void
}
