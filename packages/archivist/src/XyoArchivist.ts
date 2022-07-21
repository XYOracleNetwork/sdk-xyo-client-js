import { XyoAccount } from '@xyo-network/account'
import { XyoPayload } from '@xyo-network/payload'

import { Archivist } from './model'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export abstract class XyoArchivist<TRead extends XyoPayload = XyoPayload, TWrite extends XyoPayload = XyoPayload>
  implements Archivist<string, TWrite, TRead | undefined, string, TRead, XyoPayloadFindFilter>
{
  protected parent?: XyoArchivist<TRead, TWrite>
  protected account?: XyoAccount
  constructor(parent?: XyoArchivist<TRead, TWrite>, account?: XyoAccount) {
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
