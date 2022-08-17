import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { Huri, HuriOptions, XyoPayload } from '@xyo-network/payload'

import { XyoDivinerConfig } from '../../Abstract'
import { XyoDivinerQueryPayload } from '../../Diviner'
import { profile } from '../lib'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'

export type XyoHuriPayloadDivinerConfig = XyoDivinerConfig<{
  schema: 'network.xyo.diviner.payload.huri.config'
  options?: HuriOptions
}>

export type XyoHuriPayloadDivinerQuery = XyoDivinerQueryPayload<{
  schema: 'network.xyo.diviner.payload.huri.query'
  options?: HuriOptions
  huri: string
}>

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner<XyoHuriPayloadDivinerQuery, XyoHuriPayloadDivinerConfig> {
  protected get options() {
    return this.config.options
  }

  override async query(query: XyoHuriPayloadDivinerQuery): Promise<[XyoBoundWitness, XyoPayload[]]> {
    const huri = new Huri(query.huri, query.options ?? this.options)
    const [payload = null] = await profile(async () => await huri.fetch())
    const payloads = payload ? [payload] : []
    return [this.bindPayloads(payloads), payloads]
  }
}
