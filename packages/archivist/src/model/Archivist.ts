export interface Archivist<TWriteResponse, TWrite, TReadResponse = TWriteResponse, TId = string, TQueryResponse = TReadResponse, TQuery = unknown> {
  get(id: TId): Promise<TReadResponse[] | undefined> | TReadResponse[] | undefined
  find?(query: TQuery): Promise<TQueryResponse[]> | TQueryResponse[]
  insert?(item: TWrite): Promise<TWriteResponse[]> | TWriteResponse[]
  delete?(id: TId): Promise<boolean> | boolean
  clear?(): void
}
