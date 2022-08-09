import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { Huri, HuriOptions, XyoPayload } from '@xyo-network/payload'

import { profile } from '../lib'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoPayloadDivinerQueryPayload } from '../XyoPayloadDivinerQueryPayload'

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner {
  protected options: HuriOptions

  constructor(account: XyoAccount, options: HuriOptions) {
    super(account)
    this.options = options
  }

  override async divine(query: XyoPayloadDivinerQueryPayload): Promise<[XyoBoundWitness, XyoPayload[]]> {
    const huri = new Huri(query.huri, this.options)
    const [payload = null] = await profile(async () => await huri.fetch())
    const payloads = payload ? [payload] : []
    return [this.bind(payloads), payloads]
  }
}
