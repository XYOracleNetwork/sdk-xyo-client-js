import { XyoArchivistGetQueryPayloadSchema } from '@xyo-network/archivist'
import { XyoModuleQueryResult } from '@xyo-network/module'
import { Huri } from '@xyo-network/payload'

import { XyoAbstractDiviner } from '../../Abstract'
import { profile } from '../lib'
import { XyoPayloadDivinerQueryPayload, XyoPayloadDivinerQueryPayloadSchema } from '../Query'
import { XyoArchivistPayloadDivinerConfig } from './Config'

export class XyoArchivistPayloadDiviner extends XyoAbstractDiviner<XyoArchivistPayloadDivinerConfig, XyoPayloadDivinerQueryPayload> {
  protected get archivist() {
    return this.config.archivist
  }

  override get queries() {
    return [XyoPayloadDivinerQueryPayloadSchema]
  }

  override async query(query: XyoPayloadDivinerQueryPayload): Promise<XyoModuleQueryResult> {
    const huri = new Huri(query.huri)
    const [[, payloads = []]] = await profile(
      async () => await this.archivist.query({ hashes: [huri.hash], schema: XyoArchivistGetQueryPayloadSchema }),
    )
    const resultPayloads = payloads?.[0] ? [payloads?.[0]] : []
    return [this.bindPayloads(resultPayloads), resultPayloads]
  }
}
