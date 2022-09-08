import { assertEx } from '@xylabs/assert'
import { Archivist, XyoArchivist, XyoArchivistGetQuerySchema, XyoArchivistWrapper } from '@xyo-network/archivist'
import { PartialModuleConfig } from '@xyo-network/module'
import { Huri, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { XyoDivinerDivineQuerySchema } from '../../Queries'
import { profile } from '../lib'
import { XyoHuriPayload, XyoHuriSchema } from '../XyoHuriPayload'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoArchivistPayloadDivinerConfig, XyoArchivistPayloadDivinerConfigSchema } from './Config'

export class XyoArchivistPayloadDiviner extends XyoPayloadDiviner<XyoPayload, XyoArchivistPayloadDivinerConfig> {
  protected readonly archivist: Archivist

  constructor(config: PartialModuleConfig<XyoArchivistPayloadDivinerConfig>, archivist?: XyoArchivist) {
    super({ ...config, schema: XyoArchivistPayloadDivinerConfigSchema })
    if (archivist) {
      this.archivist = new XyoArchivistWrapper(archivist)
    } else {
      const resolvedArchivist = this.resolver?.(assertEx(config.archivist, 'No archivist specified'))
      this.archivist = new XyoArchivistWrapper(assertEx(resolvedArchivist, 'Unable to resolve archivist'))
    }
  }

  override get queries() {
    return [XyoDivinerDivineQuerySchema]
  }

  public async divine(payloads?: XyoPayloads): Promise<XyoPayload | null> {
    const huriPayload = assertEx(payloads?.find((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriSchema))
    const huriObj = new Huri(huriPayload.huri)
    const [[, [payload = null]]] = await profile(
      async () => await this.archivist.query({ hashes: [huriObj.hash], schema: XyoArchivistGetQuerySchema }),
    )
    return payload ?? null
  }
}
