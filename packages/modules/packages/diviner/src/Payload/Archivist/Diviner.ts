import { assertEx } from '@xylabs/assert'
import { PayloadArchivist, XyoArchivistGetQuery, XyoArchivistGetQuerySchema, XyoArchivistWrapper } from '@xyo-network/archivist'
import { XyoModuleParams } from '@xyo-network/module'
import { Huri, PayloadWrapper, XyoPayload } from '@xyo-network/payload'

import { XyoDivinerDivineQuerySchema } from '../../Queries'
import { XyoHuriPayload, XyoHuriSchema } from '../XyoHuriPayload'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoArchivistPayloadDivinerConfig } from './Config'

export class XyoArchivistPayloadDiviner extends XyoPayloadDiviner<XyoArchivistPayloadDivinerConfig> {
  static override async create(params?: XyoModuleParams<XyoArchivistPayloadDivinerConfig>): Promise<XyoArchivistPayloadDiviner> {
    params?.logger?.debug(`params: ${JSON.stringify(params, null, 2)}`)
    const module = new XyoArchivistPayloadDiviner(params)
    await module.start()
    return module
  }

  protected archivist?: PayloadArchivist | null

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  protected override async start() {
    await super.start()
    const configArchivistAddress = this.config?.archivist
    if (configArchivistAddress) {
      const resolvedArchivist: PayloadArchivist | null = configArchivistAddress
        ? (this.resolver?.fromAddress([configArchivistAddress]) as unknown as PayloadArchivist[]).shift() ?? null
        : null
      if (resolvedArchivist) {
        this.archivist = resolvedArchivist ? new XyoArchivistWrapper(resolvedArchivist) : null
      }
    }
    return this
  }

  public async divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriSchema),
      `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const hashes = huriPayloads.map((huriPayload) => huriPayload.huri.map((huri) => new Huri(huri).hash)).flat()
    const activeArchivist = this.archivist
    if (activeArchivist) {
      const queryPayload = PayloadWrapper.parse<XyoArchivistGetQuery>({ hashes, schema: XyoArchivistGetQuerySchema })
      const query = await this.bindQuery(queryPayload)
      return (await activeArchivist.query(query[0], query[1]))[1]
    }
    return []
  }
}
