import { assertEx } from '@xylabs/sdk-js'
import { XyoAccount } from '@xyo-network/account'
import { XyoArchivist, XyoArchivistBase, XyoPayloadFindQuery } from '@xyo-network/archivist'
import { XyoBoundWitnessWithPartialMeta } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoArchivistApi } from './Api'

export class XyoRemoteArchivist extends XyoArchivistBase {
  protected api: XyoArchivistApi
  protected archive: string
  constructor(api: XyoArchivistApi, archive: string, parent?: XyoArchivist, account?: XyoAccount) {
    super(parent, account)
    this.api = api
    this.archive = archive
  }

  public async get(hashes: string[]) {
    return await Promise.all(
      hashes.map(async (hash) => {
        const [payloads] = await this.api.archive(this.archive).payload.hash(hash).get('tuple')
        return payloads?.pop() ?? null
      })
    )
  }

  public async insert(payloads: XyoPayload[]) {
    const boundwitnesses = payloads.filter((payload) => payload.schema === 'network.xyo.payload') as XyoBoundWitnessWithPartialMeta[]
    boundwitnesses.forEach((boundwitness) => {
      boundwitness._payloads ===
        payloads.filter((payload) => {
          const hash = new XyoPayloadWrapper(payload).hash
          return boundwitness.payload_hashes.includes(hash)
        })
    })
    payloads.forEach((payload) => {
      let found = false
      const hash = new XyoPayloadWrapper(payload).hash
      boundwitnesses.forEach((boundwitnesses) => {
        if (boundwitnesses.payload_hashes.includes(hash)) {
          found = true
        }
      })
      assertEx(found, 'Payload not in Boundwitness received')
    })
    await this.api.archive(this.archive).block.post(boundwitnesses)
    return payloads
  }

  public async find<R extends XyoPayload = XyoPayload>(query: XyoPayloadFindQuery): Promise<R[]> {
    const [payloads = []] = (await this.api.archive(this.archive).payload.find(query.filter, 'tuple')) ?? []
    const [blocks = []] = (await this.api.archive(this.archive).block.find(query.filter, 'tuple')) ?? []
    return payloads.concat(blocks) as R[]
  }
}
