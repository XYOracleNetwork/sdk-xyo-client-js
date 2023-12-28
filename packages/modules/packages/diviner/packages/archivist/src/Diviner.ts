import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { HuriPayload, HuriSchema } from '@xyo-network/diviner-huri'
import { DivinerParams } from '@xyo-network/diviner-model'
import { Huri } from '@xyo-network/huri'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ArchivistPayloadDivinerConfig, ArchivistPayloadDivinerConfigSchema } from './Config'

export type ArchivistPayloadDivinerParams<
  TConfig extends AnyConfigSchema<ArchivistPayloadDivinerConfig> = AnyConfigSchema<ArchivistPayloadDivinerConfig>,
> = DivinerParams<TConfig>

export class ArchivistPayloadDiviner<TParams extends ArchivistPayloadDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [ArchivistPayloadDivinerConfigSchema]

  protected async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is HuriPayload => payload?.schema === HuriSchema),
      () => `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const hashes = huriPayloads.flatMap((huriPayload) => huriPayload.huri.map((huri) => new Huri(huri).hash))
    const activeArchivist = await this.getArchivist()
    return (await activeArchivist?.get(hashes)) ?? []
  }
}
