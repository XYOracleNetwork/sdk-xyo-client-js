import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { HuriPayload } from '@xyo-network/diviner-huri'
import { HuriSchema } from '@xyo-network/diviner-huri'
import type {
  DivinerInstance, DivinerModuleEventData, DivinerParams,
} from '@xyo-network/diviner-model'
import { Huri } from '@xyo-network/huri'
import type { AnyConfigSchema } from '@xyo-network/module-model'
import type {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'

import type { ArchivistPayloadDivinerConfig } from './Config.ts'
import { ArchivistPayloadDivinerConfigSchema } from './Config.ts'

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
  static override readonly configSchemas: Schema[] = [...super.configSchemas, ArchivistPayloadDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = ArchivistPayloadDivinerConfigSchema

  protected async divineHandler(payloads?: TIn[]): Promise<WithStorageMeta<TOut>[]> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is TIn => payload?.schema === HuriSchema),
      () => `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const hashes = huriPayloads.flatMap(huriPayload => huriPayload.huri.map(huri => new Huri(huri).hash))
    const activeArchivist = await this.archivistInstance()
    return ((await activeArchivist?.get(hashes)) as WithStorageMeta<TOut>[]) ?? []
  }
}
