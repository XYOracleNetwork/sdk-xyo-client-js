import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { Huri, HuriOptions, XyoPayload } from '@xyo-network/payload'

import { XyoDivinerConfig } from '../../Abstract'
import { XyoDivinerQueryPayload } from '../../Diviner'
import { profile } from '../lib'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoPayloadDivinerQueryPayload } from '../XyoPayloadDivinerQueryPayload'

export type XyoHuriPayloadDivinerConfig = XyoDivinerConfig<{
  schema: 'network.xyo.diviner.payload.huri.config'
  huriOptions: HuriOptions
  huri: string
}>

export type XyoHuriPayloadDivinerQuery = XyoDivinerQueryPayload<{
  schema: 'network.xyo.diviner.payload.huri.query'
  huri: string
}>

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner<XyoHuriPayloadDivinerQuery, XyoHuriPayloadDivinerConfig> {
  protected get options() {
    return this.config.huriOptions
  }

  override async query(query: XyoPayloadDivinerQueryPayload): Promise<[XyoBoundWitness, XyoPayload[]]> {
    const huri = new Huri(query.huri, this.options)
    const [payload = null] = await profile(async () => await huri.fetch())
    const payloads = payload ? [payload] : []
    return [this.bindPayloads(payloads), payloads]
  }
}
