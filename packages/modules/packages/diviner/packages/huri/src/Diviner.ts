import { assertEx } from '@xylabs/assert'
import { compact } from '@xylabs/lodash'
import { fulfilled } from '@xylabs/promise'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerParams } from '@xyo-network/diviner-model'
import { Huri } from '@xyo-network/huri'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { HuriPayloadDivinerConfig, HuriPayloadDivinerConfigSchema } from './Config'
import { HuriPayload, HuriSchema } from './HuriPayload'

export type HuriPayloadDivinerParams<TConfig extends AnyConfigSchema<HuriPayloadDivinerConfig> = AnyConfigSchema<HuriPayloadDivinerConfig>> =
  DivinerParams<TConfig>

export class HuriPayloadDiviner<TParams extends HuriPayloadDivinerParams = HuriPayloadDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [HuriPayloadDivinerConfigSchema]

  protected get options() {
    return this.config?.options
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is HuriPayload => payload?.schema === HuriSchema),
      () => `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const huriList = huriPayloads.flatMap((huriPayload, index) =>
      huriPayload.huri.map((huri) => new Huri(huri, { token: huriPayload.tokens?.[index] })),
    )

    const settled = await Promise.allSettled(huriList.map((huri) => huri.fetch()))
    return compact(settled.filter(fulfilled).map((settle) => settle.value))
  }
}
