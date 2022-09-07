import { assertEx } from '@xylabs/assert'
import { Huri, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { XyoDivinerDivineQuerySchema } from '../../Queries'
import { profile } from '../lib'
import { XyoHuriPayload, XyoHuriSchema } from '../XyoHuriPayload'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoHuriPayloadDivinerConfig } from './Config'

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner<XyoPayload, XyoHuriPayloadDivinerConfig> {
  protected get options() {
    return this.config.options
  }

  override get queries() {
    return [XyoDivinerDivineQuerySchema]
  }

  override async divine(payloads?: XyoPayloads): Promise<XyoPayload | null> {
    const huriPayload = assertEx(payloads?.find((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriSchema))
    const huri = new Huri(huriPayload?.huri, this.options)
    const [payload = null] = await profile(async () => await huri.fetch())
    return payload ?? null
  }
}
