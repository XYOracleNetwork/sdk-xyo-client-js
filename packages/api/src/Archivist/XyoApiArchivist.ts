import { assertEx } from '@xylabs/sdk-js'
import { XyoAccount } from '@xyo-network/account'
import { XyoArchivist, XyoPayloadFindFilter } from '@xyo-network/archivist'
import { XyoBoundWitnessWithPartialMeta } from '@xyo-network/boundwitness'

import { XyoArchivistApi } from './Api'

export class XyoApiArchivist extends XyoArchivist {
  protected api: XyoArchivistApi
  protected archive: string
  constructor(api: XyoArchivistApi, archive: string, parent?: XyoArchivist, account?: XyoAccount) {
    super(parent, account)
    this.api = api
    this.archive = archive
  }

  public async get(hash: string) {
    const [payloads] = await this.api.archive(this.archive).payload.hash(hash).get('tuple')
    return payloads?.pop()
  }

  public async insert(payload: XyoBoundWitnessWithPartialMeta) {
    return (await this.api.archive(this.archive).block.post([payload]))?.map((value) => assertEx(value._hash)) ?? []
  }

  public async find(filter: XyoPayloadFindFilter) {
    const [payloads = []] = (await this.api.archive(this.archive).payload.find(filter, 'tuple')) ?? []
    const [blocks = []] = (await this.api.archive(this.archive).block.find(filter, 'tuple')) ?? []
    return payloads.concat(blocks)
  }
}
