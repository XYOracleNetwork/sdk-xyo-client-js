import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { DivinerParams } from '@xyo-network/diviner-model'
import { Huri } from '@xyo-network/huri'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import compact from 'lodash/compact'

import { AbstractPayloadDiviner } from '../AbstractPayloadDiviner'
import { HuriPayload, HuriSchema } from '../XyoHuriPayload'
import { HuriPayloadDivinerConfig, HuriPayloadDivinerConfigSchema } from './Config'

export type HuriPayloadDivinerParams<TConfig extends AnyConfigSchema<HuriPayloadDivinerConfig> = AnyConfigSchema<HuriPayloadDivinerConfig>> =
  DivinerParams<TConfig>

export class HuriPayloadDiviner<TParams extends HuriPayloadDivinerParams = HuriPayloadDivinerParams> extends AbstractPayloadDiviner<TParams> {
  static override configSchema = HuriPayloadDivinerConfigSchema

  protected get options() {
    return this.config?.options
  }

  override async divine(payloads?: Payload[]): Promise<Payload[]> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is HuriPayload => payload?.schema === HuriSchema),
      () => `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const huriList = huriPayloads
      .map((huriPayload, index) => huriPayload.huri.map((huri) => new Huri(huri, { token: huriPayload.tokens?.[index] })))
      .flat()

    const settled = await Promise.allSettled(huriList.map((huri) => huri.fetch()))
    return compact(settled.filter(fulfilled).map((settle) => settle.value))
  }
}
