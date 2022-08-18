import { XyoModuleQueryResult } from '@xyo-network/module'
import { Huri } from '@xyo-network/payload'

import { profile } from '../lib'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoHuriPayloadDivinerConfig } from './Config'
import { XyoHuriPayloadDivinerQuery } from './Query'

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner<XyoHuriPayloadDivinerQuery, XyoHuriPayloadDivinerConfig> {
  protected get options() {
    return this.config.options
  }

  override async query(query: XyoHuriPayloadDivinerQuery): Promise<XyoModuleQueryResult> {
    const huri = new Huri(query.huri, query.options ?? this.options)
    const [payload = null] = await profile(async () => await huri.fetch())
    const payloads = payload ? [payload] : []
    return [this.bindPayloads(payloads), payloads]
  }
}
