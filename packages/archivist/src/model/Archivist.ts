export interface Archivist<TReadResponse, TWriteResponse = TReadResponse, TWrite = TReadResponse, TQueryResponse = TReadResponse, TQuery = unknown, TId = string> {
  get(id: TId): Promise<TReadResponse | undefined> | TReadResponse | undefined
  find?(query: TQuery): Promise<TQueryResponse[]> | TQueryResponse[]
  insert?(item: TWrite[]): Promise<TWriteResponse[]> | TWriteResponse[]
  delete?(id: TId): Promise<boolean> | boolean
  clear?(): void
}
