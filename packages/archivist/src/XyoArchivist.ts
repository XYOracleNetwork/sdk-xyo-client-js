import { XyoAccount } from '@xyo-network/account'
import { XyoPayload } from '@xyo-network/payload'

import { Archivist } from './model'
import { XyoPayloadFindQuery } from './XyoPayloadFindFilter'

export type XyoArchivist<T extends XyoPayload = XyoPayload> = Archivist<T, T, T, T, XyoPayloadFindQuery>

export abstract class XyoArchivistBase<T extends XyoPayload = XyoPayload> implements XyoArchivist<T> {
  protected parent?: XyoArchivist<T>
  protected account?: XyoAccount
  constructor(parent?: XyoArchivist<T>, account?: XyoAccount) {
    this.parent = parent
    this.account = account
  }

  abstract insert(payloads: T[]): T[] | Promise<T[]>
  abstract find<R extends T = T>(query: XyoPayloadFindQuery): R[] | Promise<R[]>
  abstract get(hash: string[]): (T | null)[] | Promise<(T | null)[]>
  public all(): T[] | Promise<T[]> {
    throw Error('getAll not supported')
  }
  public delete(_hashes: string[]): boolean[] | Promise<boolean[]> {
    throw Error('delete not supported')
  }
  public clear(): void | Promise<void> {
    throw Error('clear not supported')
  }
  public commit() {
    throw Error('commit not supported')
  }
}
