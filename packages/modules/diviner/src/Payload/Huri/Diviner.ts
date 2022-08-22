import { Huri, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { XyoDivinerDivineQuerySchema } from '../../Query'
import { profile } from '../lib'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoHuriPayloadDivinerConfig } from './Config'

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner<XyoHuriPayloadDivinerConfig> {
  protected get options() {
    return this.config.options
  }

  override get queries() {
    return [XyoDivinerDivineQuerySchema]
  }

  override async divine(_payloads?: XyoPayloads): Promise<XyoPayload | null> {
    const huri = new Huri(this.config.huri, this.options)
    const [payload = null] = await profile(async () => await huri.fetch())
    return payload
  }
}
