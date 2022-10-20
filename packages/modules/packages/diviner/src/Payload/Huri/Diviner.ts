import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { Huri, XyoPayloads } from '@xyo-network/payload'
import compact from 'lodash/compact'

import { XyoDivinerDivineQuerySchema } from '../../Queries'
import { XyoHuriPayload, XyoHuriSchema } from '../XyoHuriPayload'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoHuriPayloadDivinerConfig } from './Config'

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner<XyoHuriPayloadDivinerConfig> {
  static override async create(params?: XyoModuleParams<XyoHuriPayloadDivinerConfig>): Promise<XyoHuriPayloadDiviner> {
    const module = new XyoHuriPayloadDiviner(params)
    await module.start()
    return module
  }

  protected get options() {
    return this.config?.options
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  override async divine(payloads?: XyoPayloads): Promise<XyoPayloads> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriSchema),
      `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const huriList = huriPayloads.map((huriPayload) => huriPayload.huri.map((huri) => new Huri(huri))).flat()

    const settled = await Promise.allSettled(huriList.map((huri) => huri.fetch()))
    return compact(settled.map((settle) => (settle.status === 'fulfilled' ? settle.value : null)))
  }
}
