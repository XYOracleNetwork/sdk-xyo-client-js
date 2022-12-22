export interface Repository<
  TReadResponse,
  TWriteResponse = TReadResponse,
  TWrite = TReadResponse,
  TFindResponse = TReadResponse[],
  TFindFilter = Partial<TReadResponse>,
  TId = string,
> {
  find(predicate: TFindFilter): TFindResponse
  get(id: TId): TReadResponse
  insert(value: TWrite): TWriteResponse
}
