import { XyoAccount } from '@xyo-network/account'
import { XyoArchivist } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { Huri, XyoPayload } from '@xyo-network/payload'

import { profile } from '../lib'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoPayloadDivinerPayload, XyoPayloadDivinerPayloadSchema } from '../XyoPayloadDivinerPayload'
import { XyoPayloadDivinerQueryPayload } from '../XyoPayloadDivinerQueryPayload'

export class XyoArchivistPayloadDiviner extends XyoPayloadDiviner {
  protected archivist: XyoArchivist

  constructor(account: XyoAccount, archivist: XyoArchivist) {
    super(account)
    this.archivist = archivist
  }

  override async divine(query: XyoPayloadDivinerQueryPayload): Promise<[XyoBoundWitness, XyoPayload[]]> {
    const huri = new Huri(query.huri)
    const [payloads = [], duration] = await profile(async () => await this.archivist.get([huri.hash]))
    const resultPayload: XyoPayloadDivinerPayload = { duration, payload: payloads.pop() ?? null, schema: XyoPayloadDivinerPayloadSchema }
    return [this.bind([resultPayload]), [resultPayload]]
  }
}
