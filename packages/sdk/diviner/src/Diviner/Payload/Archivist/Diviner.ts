import { XyoArchivist } from '@xyo-network/archivist'
import { Huri } from '@xyo-network/payload'

import { XyoAbstractDiviner } from '../../Diviner'
import { profile } from '../lib'
import { XyoPayloadDivinerPayload, XyoPayloadDivinerPayloadSchema } from '../XyoPayloadDivinerPayload'
import { XyoPayloadDivinerQueryPayload } from '../XyoPayloadDivinerQueryPayload'

export class XyoArchivistPayloadDiviner extends XyoAbstractDiviner<XyoPayloadDivinerPayload, XyoPayloadDivinerQueryPayload> {
  protected archivist: XyoArchivist

  constructor(archivist: XyoArchivist) {
    super()
    this.archivist = archivist
  }

  override async divine(query: XyoPayloadDivinerQueryPayload): Promise<XyoPayloadDivinerPayload> {
    const huri = new Huri(query.huri)
    const [payload = [], duration] = await profile(async () => await this.archivist.get([huri.hash]))
    return { duration, payload: payload.pop() ?? null, schema: XyoPayloadDivinerPayloadSchema }
  }
}
