import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { HuriPayload, HuriSchema } from '@xyo-network/diviner-huri'
import { DivinerInstance, DivinerModuleEventData, DivinerParams } from '@xyo-network/diviner-model'
import { Huri } from '@xyo-network/huri'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload, WithMeta } from '@xyo-network/payload-model'

import { ArchivistPayloadDivinerConfig, ArchivistPayloadDivinerConfigSchema } from './Config'

export type ArchivistPayloadDivinerParams<
  TConfig extends AnyConfigSchema<ArchivistPayloadDivinerConfig> = AnyConfigSchema<ArchivistPayloadDivinerConfig>,
> = DivinerParams<TConfig>

export class ArchivistPayloadDiviner<
  TParams extends ArchivistPayloadDivinerParams,
  TIn extends HuriPayload = HuriPayload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override configSchemas = [ArchivistPayloadDivinerConfigSchema]

  protected async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is TIn => payload?.schema === HuriSchema),
      () => `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const hashes = huriPayloads.flatMap((huriPayload) => huriPayload.huri.map((huri) => new Huri(huri).hash))
    const activeArchivist = await this.getArchivist()
    return ((await activeArchivist?.get(hashes)) as WithMeta<TOut>[]) ?? []
  }
}
