import { Promisable } from '@xyo-network/promise'

export interface Repository<
  TReadResponse,
  TWriteResponse = TReadResponse,
  TWrite = TReadResponse,
  TFindResponse = TReadResponse[],
  TFindFilter = Partial<TReadResponse>,
  TId = string,
> {
  find(predicate: TFindFilter): Promisable<TFindResponse>
  get(id: TId): Promisable<TReadResponse | undefined>
  insert(value: TWrite): Promisable<TWriteResponse>
}
