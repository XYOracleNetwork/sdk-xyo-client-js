import { assertEx } from '@xylabs/assert'
import { ArchivistGetQuery, ArchivistGetQuerySchema, ArchivistModule } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { DivinerParams } from '@xyo-network/diviner-model'
import { Huri } from '@xyo-network/huri'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { AbstractPayloadDiviner } from '../AbstractPayloadDiviner'
import { HuriPayload, HuriSchema } from '../HuriPayload'
import { ArchivistPayloadDivinerConfig, ArchivistPayloadDivinerConfigSchema } from './Config'

export type ArchivistPayloadDivinerParams<
  TConfig extends AnyConfigSchema<ArchivistPayloadDivinerConfig> = AnyConfigSchema<ArchivistPayloadDivinerConfig>,
> = DivinerParams<TConfig>

export class ArchivistPayloadDiviner<TParams extends ArchivistPayloadDivinerParams> extends AbstractPayloadDiviner<TParams> {
  static override configSchemas = [ArchivistPayloadDivinerConfigSchema]

  async divine(payloads?: Payload[]): Promise<Payload[]> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is HuriPayload => payload?.schema === HuriSchema),
      () => `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const hashes = huriPayloads.map((huriPayload) => huriPayload.huri.map((huri) => new Huri(huri).hash)).flat()
    const activeArchivist = await this.archivist()
    if (activeArchivist) {
      const queryPayload = PayloadWrapper.wrap<ArchivistGetQuery>({ hashes, schema: ArchivistGetQuerySchema })
      const query = await this.bindQuery(queryPayload)
      return (await activeArchivist.query(query[0], query[1]))[1]
    }
    return []
  }

  protected async archivist(): Promise<ArchivistModule | null> {
    const configArchivistAddress = this.config?.archivist
    if (configArchivistAddress) {
      const resolvedArchivist: ArchivistModule | null = configArchivistAddress
        ? ((await this.resolve({ address: [configArchivistAddress] })) as unknown as ArchivistModule[]).shift() ?? null
        : null
      if (resolvedArchivist) {
        return resolvedArchivist ? new ArchivistWrapper({ account: this.account, module: resolvedArchivist }) : null
      }
    }
    return null
  }
}
