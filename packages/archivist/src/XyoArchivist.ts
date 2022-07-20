import { XyoAccount } from '@xyo-network/account'
import { XyoPayload } from '@xyo-network/payload'

import { Archivist } from './model'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export abstract class XyoArchivist<TWrite extends XyoPayload = XyoPayload, TRead extends XyoPayload = XyoPayload>
  implements Archivist<string, TWrite, TRead | undefined, string, TRead, XyoPayloadFindFilter>
{
  protected parent?: XyoArchivist<TWrite, TRead>
  protected account?: XyoAccount
  constructor(parent?: XyoArchivist<TWrite, TRead>, account?: XyoAccount) {
    this.parent = parent
    this.account = account
  }
  abstract insert(item: TWrite): string[] | Promise<string[]>
  abstract find(query: XyoPayloadFindFilter): TRead[] | Promise<TRead[]>
  abstract get(hash: string): TRead[] | Promise<TRead[] | undefined> | undefined
  public all(): TRead[] | Promise<TRead[] | undefined> | undefined {
    throw Error('getAll not supported')
  }
  public delete(_hash: string): boolean | Promise<boolean> {
    throw Error('delete not supported')
  }
  public clear(): void | Promise<void> {
    throw Error('clear not supported')
  }
  public commit() {
    throw Error('commit not supported')
  }
}
