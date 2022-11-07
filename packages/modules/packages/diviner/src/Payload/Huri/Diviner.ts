import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { Huri, XyoPayload } from '@xyo-network/payload'
import compact from 'lodash/compact'

import { XyoDivinerDivineQuerySchema } from '../../Queries'
import { XyoHuriPayload, XyoHuriSchema } from '../XyoHuriPayload'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoHuriPayloadDivinerConfig, XyoHuriPayloadDivinerConfigSchema } from './Config'

export class XyoHuriPayloadDiviner extends XyoPayloadDiviner<XyoHuriPayloadDivinerConfig> {
  static override configSchema: XyoHuriPayloadDivinerConfigSchema

  protected get options() {
    return this.config?.options
  }

  static override async create(params?: Partial<XyoModuleParams<XyoHuriPayloadDivinerConfig>>): Promise<XyoHuriPayloadDiviner> {
    return (await super.create(params)) as XyoHuriPayloadDiviner
  }

  override async divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriSchema),
      `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const huriList = huriPayloads.map((huriPayload) => huriPayload.huri.map((huri) => new Huri(huri))).flat()

    const settled = await Promise.allSettled(huriList.map((huri) => huri.fetch()))
    return compact(settled.map((settle) => (settle.status === 'fulfilled' ? settle.value : null)))
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }
}
