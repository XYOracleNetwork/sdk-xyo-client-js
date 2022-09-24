import { assertEx } from '@xylabs/assert'
import { PayloadArchivist, XyoArchivistGetQuery, XyoArchivistGetQuerySchema, XyoArchivistWrapper } from '@xyo-network/archivist'
import { PartialModuleConfig, XyoModuleResolverFunc } from '@xyo-network/module'
import { Huri, PayloadWrapper, XyoPayloads } from '@xyo-network/payload'

import { XyoDivinerDivineQuerySchema } from '../../Queries'
import { profile } from '../lib'
import { XyoHuriPayload, XyoHuriSchema } from '../XyoHuriPayload'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoArchivistPayloadDivinerConfig, XyoArchivistPayloadDivinerConfigSchema } from './Config'

export class XyoArchivistPayloadDiviner extends XyoPayloadDiviner<XyoArchivistPayloadDivinerConfig> {
  protected readonly archivist?: PayloadArchivist | null

  constructor(config?: PartialModuleConfig<XyoArchivistPayloadDivinerConfig>, archivist?: PayloadArchivist, resolver?: XyoModuleResolverFunc) {
    super({ ...config, schema: XyoArchivistPayloadDivinerConfigSchema }, undefined, resolver)
    const configArchivistAddress = config?.archivist
    const resolvedArchivist: PayloadArchivist | null =
      archivist ?? (configArchivistAddress ? (this.resolver?.(configArchivistAddress) as unknown as PayloadArchivist) ?? null : null)
    if (resolvedArchivist) {
      this.archivist = resolvedArchivist ? new XyoArchivistWrapper(resolvedArchivist) : null
    }
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  public async divine(context?: string, payloads?: XyoPayloads): Promise<XyoPayloads> {
    const huriPayloads = assertEx(
      payloads?.filter((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriSchema),
      `no huri payloads provided: ${JSON.stringify(payloads, null, 2)}`,
    )
    const huriPayload = context
      ? assertEx(
          huriPayloads.find((payload) => PayloadWrapper.hash(payload) === context),
          `context hash provided not found [${context}, ${JSON.stringify(payloads, null, 2)}]`,
        )
      : huriPayloads[0]
    const hashes = huriPayload.huri.map((huri) => new Huri(huri).hash)
    const activeArchivist = this.archivist
    if (activeArchivist) {
      const query: XyoArchivistGetQuery = { hashes, schema: XyoArchivistGetQuerySchema }
      const bw = (await this.bindPayloads([query]))[0]
      const [[, payloads]] = await profile(async () => await activeArchivist.query(bw, query))
      return payloads
    }
    return []
  }
}
