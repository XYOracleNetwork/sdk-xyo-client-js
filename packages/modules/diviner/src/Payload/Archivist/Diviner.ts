import { XyoArchivistGetQueryPayloadSchema } from '@xyo-network/archivist'
import { Huri, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { XyoDivinerDivineQuerySchema } from '../../Query'
import { profile } from '../lib'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoArchivistPayloadDivinerConfig } from './Config'

export class XyoArchivistPayloadDiviner extends XyoPayloadDiviner<XyoArchivistPayloadDivinerConfig> {
  protected get archivist() {
    return this.config.archivist
  }

  override get queries() {
    return [XyoDivinerDivineQuerySchema]
  }

  public async divine(_payloads: XyoPayloads): Promise<XyoPayload | null> {
    const huriObj = new Huri(this.config.huri)
    const [[, payloads = []]] = await profile(
      async () => await this.archivist.query({ hashes: [huriObj.hash], schema: XyoArchivistGetQueryPayloadSchema }),
    )
    return payloads?.[0] ?? null
  }
}
