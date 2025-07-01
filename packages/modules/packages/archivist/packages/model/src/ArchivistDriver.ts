import type { Promisable } from '@xylabs/promise'

import type { NextOptions } from './NextOptions.ts'

export interface ArchivistDriver<TId, TIn, TOut extends TIn> {
  all(): Promisable<TOut[]>
  clear(): Promisable<void>
  count(): number
  delete(hashes: TId[]): Promise<TOut[]>
  get(hashes: TId[]): Promisable<TOut[]>
  insert(payloads: TIn[]): TOut[]
  next(options?: NextOptions): Promisable<TOut[]>
}
