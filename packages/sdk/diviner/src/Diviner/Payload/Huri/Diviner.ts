import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { Huri, HuriOptions } from '@xyo-network/payload'

import { profile } from '../lib'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoPayloadDivinerPayload, XyoPayloadDivinerPayloadSchema } from '../XyoPayloadDivinerPayload'
import { XyoPayloadDivinerQueryPayload } from '../XyoPayloadDivinerQueryPayload'

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner {
  protected options: HuriOptions

  constructor(account: XyoAccount, options: HuriOptions) {
    super(account)
    this.options = options
  }

  override async divine(query: XyoPayloadDivinerQueryPayload): Promise<XyoBoundWitness> {
    const huri = new Huri(query.huri, this.options)
    const [payload = null, duration] = await profile(async () => await huri.fetch())
    const resultPayload: XyoPayloadDivinerPayload = { duration, payload, schema: XyoPayloadDivinerPayloadSchema }
    return this.bind([resultPayload])
  }
}
