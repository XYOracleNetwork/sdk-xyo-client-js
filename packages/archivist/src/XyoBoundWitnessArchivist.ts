import { assertEx } from '@xylabs/sdk-js'
import { XyoBoundWitnessBuilder, XyoBoundWitnessWithMeta } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'

import { XyoArchivist } from './XyoArchivist'

export abstract class XyoBoundWitnessArchivist<TRead extends XyoPayload = XyoPayload, TWrite extends XyoBoundWitnessWithMeta = XyoBoundWitnessWithMeta> extends XyoArchivist<
  TRead,
  TWrite
> {
  public async commit() {
    const parent = assertEx(this.parent, 'Parent is required for commit')
    const account = assertEx(this.account, 'Account is required for commit')
    const payloads = assertEx(await parent.all(), 'Nothing to commit')
    const builder = new XyoBoundWitnessBuilder<TWrite, TRead>()
    const block = builder.payloads(payloads).witness(account).build()
    const [hash] = await parent.insert(block)
    await this.clear()
    return hash
  }
}
