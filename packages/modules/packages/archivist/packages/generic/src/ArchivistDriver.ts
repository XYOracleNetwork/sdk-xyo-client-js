import type { EmptyObject } from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import type { NextOptions } from '@xyo-network/archivist-model'

export interface ArchivistDriver<TId, TIn, TOut extends TIn, TConfig extends EmptyObject = EmptyObject> {
  all(): Promisable<TOut[]>
  clear(): Promisable<void>
  count(): number
  delete(hashes: TId[]): Promise<TOut[]>
  get(hashes: TId[]): Promisable<TOut[]>
  insert(payloads: TIn[]): TOut[]
  next(options?: NextOptions): Promisable<TOut[]>
}
