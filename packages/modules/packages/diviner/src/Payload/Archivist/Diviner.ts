import { assertEx } from '@xylabs/assert'
import { ArchivistGetQuery, ArchivistGetQuerySchema, PayloadArchivist } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { Huri } from '@xyo-network/huri'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { AbstractPayloadDiviner } from '../AbstractPayloadDiviner'
import { XyoHuriPayload, XyoHuriSchema } from '../XyoHuriPayload'
import { XyoArchivistPayloadDivinerConfig, XyoArchivistPayloadDivinerConfigSchema } from './Config'

export class ArchivistPayloadDiviner extends AbstractPayloadDiviner<XyoArchivistPayloadDivinerConfig> {
  static override configSchema: XyoArchivistPayloadDivinerConfigSchema

  static override async create(params?: ModuleParams<XyoArchivistPayloadDivinerConfig>): Promise<ArchivistPayloadDiviner> {
    return (await super.create(params)) as ArchivistPayloadDiviner
  }

  public async divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriSchema),
      `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const hashes = huriPayloads.map((huriPayload) => huriPayload.huri.map((huri) => new Huri(huri).hash)).flat()
    const activeArchivist = await this.archivist()
    if (activeArchivist) {
      const queryPayload = PayloadWrapper.parse<ArchivistGetQuery>({ hashes, schema: ArchivistGetQuerySchema })
      const query = await this.bindQuery(queryPayload)
      return (await activeArchivist.query(query[0], query[1]))[1]
    }
    return []
  }

  protected async archivist(): Promise<PayloadArchivist | null> {
    const configArchivistAddress = this.config?.archivist
    if (configArchivistAddress) {
      const resolvedArchivist: PayloadArchivist | null = configArchivistAddress
        ? ((await this.resolve({ address: [configArchivistAddress] })) as unknown as PayloadArchivist[]).shift() ?? null
        : null
      if (resolvedArchivist) {
        return resolvedArchivist ? new ArchivistWrapper(resolvedArchivist) : null
      }
    }
    return null
  }
}
