import { assertEx } from '@xylabs/assert'
import { XyoArchivistGetQueryPayloadSchema } from '@xyo-network/archivist'
import { Huri, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { XyoDivinerDivineQuerySchema } from '../../Query'
import { profile } from '../lib'
import { XyoHuriPayload, XyoHuriPayloadSchema } from '../XyoHuriPayload'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoArchivistPayloadDivinerConfig } from './Config'

export class XyoArchivistPayloadDiviner extends XyoPayloadDiviner<XyoArchivistPayloadDivinerConfig> {
  protected get archivist() {
    return this.config.archivist
  }

  override get queries() {
    return [XyoDivinerDivineQuerySchema]
  }

  public async divine(payloads?: XyoPayloads): Promise<XyoPayload | null> {
    const huriPayload = assertEx(payloads?.find((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriPayloadSchema))
    const huriObj = new Huri(huriPayload.huri)
    const [[, resultPayloads = []]] = await profile(
      async () => await this.archivist.query({ hashes: [huriObj.hash], schema: XyoArchivistGetQueryPayloadSchema }),
    )
    return resultPayloads?.[0] ?? null
  }
}
