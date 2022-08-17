import { XyoAccount } from '@xyo-network/account'
import { XyoArchivist } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { Huri, XyoPayload } from '@xyo-network/payload'

import { profile } from '../lib'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoPayloadDivinerQueryPayload } from '../XyoPayloadDivinerQueryPayload'

export class XyoArchivistPayloadDiviner extends XyoPayloadDiviner {
  protected archivist: XyoArchivist

  constructor(account: XyoAccount, archivist: XyoArchivist) {
    super({ account, schema: 'network.xyo.diviner.payload.config', targetSchema: 'network.xyo.payload' })
    this.archivist = archivist
  }

  override async query(query: XyoPayloadDivinerQueryPayload): Promise<[XyoBoundWitness, XyoPayload[]]> {
    const huri = new Huri(query.huri)
    const [payloads = []] = await profile(async () => await this.archivist.get([huri.hash]))
    const resultPayloads = payloads?.[0] ? [payloads?.[0]] : []
    return [this.bindPayloads(resultPayloads), resultPayloads]
  }
}
