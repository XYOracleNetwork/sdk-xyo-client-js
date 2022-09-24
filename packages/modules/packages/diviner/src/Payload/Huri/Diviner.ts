import { assertEx } from '@xylabs/assert'
import { Huri, PayloadWrapper, XyoPayloads } from '@xyo-network/payload'
import compact from 'lodash/compact'

import { XyoDivinerDivineQuerySchema } from '../../Queries'
import { XyoHuriPayload, XyoHuriSchema } from '../XyoHuriPayload'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoHuriPayloadDivinerConfig } from './Config'

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner<XyoHuriPayloadDivinerConfig> {
  protected get options() {
    return this.config?.options
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  override async divine(context?: string, payloads?: XyoPayloads): Promise<XyoPayloads> {
    const huriPayloads = assertEx(payloads?.filter((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriSchema))
    const huriPayload = assertEx(huriPayloads.find((payload) => PayloadWrapper.hash(payload) === context))
    const huriObj = huriPayload.huri.map((huri) => new Huri(huri))

    const settled = await Promise.allSettled(huriObj.map((huri) => huri.fetch()))
    return compact(settled.map((settle) => (settle.status === 'fulfilled' ? settle.value : null)))
  }
}
