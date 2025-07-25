import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { fulfilled } from '@xylabs/promise'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type {
  DivinerInstance, DivinerModuleEventData, DivinerParams,
} from '@xyo-network/diviner-model'
import { Huri } from '@xyo-network/huri'
import type { AnyConfigSchema } from '@xyo-network/module-model'
import type { Payload, Schema } from '@xyo-network/payload-model'

import type { HuriPayloadDivinerConfig } from './Config.ts'
import { HuriPayloadDivinerConfigSchema } from './Config.ts'
import type { HuriPayload } from './HuriPayload.ts'
import { HuriSchema } from './HuriPayload.ts'

export type HuriPayloadDivinerParams<TConfig extends AnyConfigSchema<HuriPayloadDivinerConfig> = AnyConfigSchema<HuriPayloadDivinerConfig>>
  = DivinerParams<TConfig>

export class HuriPayloadDiviner<
  TParams extends HuriPayloadDivinerParams = HuriPayloadDivinerParams,
  TIn extends HuriPayload = HuriPayload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, HuriPayloadDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = HuriPayloadDivinerConfigSchema

  protected get options() {
    return this.config?.options
  }

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is TIn => payload?.schema === HuriSchema),
      () => `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const huriList = huriPayloads.flatMap((huriPayload, index) =>
      huriPayload.huri.map(huri => new Huri(huri, { token: huriPayload.tokens?.[index] })))

    const settled = await Promise.allSettled(huriList.map(huri => huri.fetch()))
    return (settled.filter(fulfilled).map(settle => settle.value)).filter(exists) as TOut[]
  }
}
