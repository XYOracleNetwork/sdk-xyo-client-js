import { assertEx } from '@xylabs/sdk-js'
import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness, XyoBoundWitnessBuilder, XyoBoundWitnessWithPartialMeta } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWithPartialMeta } from '@xyo-network/payload'

import { Archivist } from './model'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export abstract class XyoArchivist<TWrite extends XyoBoundWitness = XyoBoundWitnessWithPartialMeta, TRead extends XyoPayload = XyoPayloadWithPartialMeta>
  implements Archivist<string[], TWrite, TRead | undefined, string, TRead[], XyoPayloadFindFilter>
{
  protected parent?: XyoArchivist
  protected account?: XyoAccount
  constructor(parent?: XyoArchivist, account?: XyoAccount) {
    this.parent = parent
    this.account = account
  }
  abstract insert(item: TWrite): string[] | Promise<string[]>
  abstract find(query: XyoPayloadFindFilter): TRead[] | Promise<TRead[]>
  abstract get(hash: string): TRead | Promise<TRead | undefined> | undefined
  public all(): TRead[] | Promise<TRead[] | undefined> | undefined {
    throw Error('getAll not supported')
  }
  public delete(_hash: string): boolean | Promise<boolean> {
    throw Error('delete not supported')
  }
  public clear(): void | Promise<void> {
    throw Error('clear not supported')
  }
  public async commit() {
    const parent = assertEx(this.parent, 'Parent is required for commit')
    const account = assertEx(this.account, 'Account is required for commit')
    const payloads = assertEx(await parent.all(), 'Nothing to commit')
    const builder = new XyoBoundWitnessBuilder()
    const block = builder.payloads(payloads).witness(account).build()
    const [hash] = await parent.insert(block)
    await this.clear()
    return hash
  }
}
