import { assertEx } from '@xylabs/assert'
import { PayloadArchivist, XyoArchivistGetQuery, XyoArchivistGetQuerySchema, XyoArchivistWrapper } from '@xyo-network/archivist'
import { PartialModuleConfig, XyoModuleResolverFunc } from '@xyo-network/module'
import { Huri, XyoPayload, XyoPayloads } from '@xyo-network/payload'

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

  public async divine(payloads?: XyoPayloads): Promise<XyoPayload | null> {
    const huriPayload = assertEx(payloads?.find((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriSchema))
    const huriObj = new Huri(huriPayload.huri)
    const activeArchivist = this.archivist
    if (activeArchivist) {
      const query: XyoArchivistGetQuery = { hashes: [huriObj.hash], schema: XyoArchivistGetQuerySchema }
      const bw = (await this.bindPayloads([query]))[0]
      const [[, [payload = null]]] = await profile(async () => await activeArchivist.query(bw, query))
      return payload ?? null
    }
    return null
  }
}
