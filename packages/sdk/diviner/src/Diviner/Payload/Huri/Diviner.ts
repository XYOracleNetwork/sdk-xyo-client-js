import { Huri, HuriOptions } from '@xyo-network/payload'

import { profile } from '../lib'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoPayloadDivinerPayload, XyoPayloadDivinerPayloadSchema } from '../XyoPayloadDivinerPayload'
import { XyoPayloadDivinerQueryPayload } from '../XyoPayloadDivinerQueryPayload'

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner {
  protected options: HuriOptions

  constructor(options: HuriOptions) {
    super()
    this.options = options
  }

  override async divine(query: XyoPayloadDivinerQueryPayload): Promise<XyoPayloadDivinerPayload> {
    const huri = new Huri(query.huri, this.options)
    const [payload = null, duration] = await profile(huri.fetch)
    return { duration, payload, schema: XyoPayloadDivinerPayloadSchema }
  }
}
