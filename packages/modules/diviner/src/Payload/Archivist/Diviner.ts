import { XyoArchivistGetQueryPayloadSchema } from '@xyo-network/archivist'
import { XyoModuleQueryResult } from '@xyo-network/module'
import { Huri } from '@xyo-network/payload'

import { profile } from '../lib'
import { XyoPayloadDivinerQueryPayload } from '../Query'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoArchivistPayloadDivinerConfig } from './Config'
import { XyoArchivistPayloadDivinerQuery } from './Query'

export class XyoArchivistPayloadDiviner extends XyoPayloadDiviner<XyoArchivistPayloadDivinerQuery, XyoArchivistPayloadDivinerConfig> {
  protected get archivist() {
    return this.config.archivist
  }

  override async query(query: XyoPayloadDivinerQueryPayload): Promise<XyoModuleQueryResult> {
    const huri = new Huri(query.huri)
    const [payloads = []] = await profile(async () => await this.archivist.query({ hashes: [huri.hash], schema: XyoArchivistGetQueryPayloadSchema }))
    const resultPayloads = payloads?.[0] ? [payloads?.[0]] : []
    return [this.bindPayloads(resultPayloads), resultPayloads]
  }
}
