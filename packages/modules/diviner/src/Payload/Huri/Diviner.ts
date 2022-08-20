import { XyoModuleQueryResult } from '@xyo-network/module'
import { Huri } from '@xyo-network/payload'

import { profile } from '../lib'
import { XyoPayloadDivinerQueryPayload, XyoPayloadDivinerQueryPayloadSchema } from '../Query'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoHuriPayloadDivinerConfig } from './Config'

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner<XyoHuriPayloadDivinerConfig, XyoPayloadDivinerQueryPayload> {
  protected get options() {
    return this.config.options
  }

  override get queries() {
    return [XyoPayloadDivinerQueryPayloadSchema]
  }

  override async query(query: XyoPayloadDivinerQueryPayload): Promise<XyoModuleQueryResult> {
    const huri = new Huri(query.huri, this.options)
    const [payload = null] = await profile(async () => await huri.fetch())
    const payloads = payload ? [payload] : []
    return [this.bindPayloads(payloads), payloads]
  }
}
