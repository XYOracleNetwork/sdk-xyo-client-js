import { assertEx } from '@xylabs/sdk-js'
import { XyoAbstractArchivist, XyoArchivistQueryPayload, XyoPayloadFindFilter } from '@xyo-network/archivist'
import { XyoBoundWitness, XyoBoundWitnessWithPartialMeta } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoRemoteArchivistConfig } from './XyoRemoteArchivistConfig'

/** @description Archivist Context that connects to a remote archivist using the API */
export class XyoRemoteArchivist extends XyoAbstractArchivist<XyoArchivistQueryPayload, XyoRemoteArchivistConfig> {
  query<Q>(_query: Q): Promisable<[XyoBoundWitness, XyoPayload<{ schema: string }>[]]> {
    throw new Error('Method not implemented.')
  }
  public get api() {
    return assertEx(this.config?.api, 'API not defined')
  }

  public get archive() {
    return this.config?.archive
  }

  public async get(hashes: string[]) {
    return await Promise.all(
      hashes.map(async (hash) => {
        const [payloads] = await this.api.archive(this.archive).payload.hash(hash).get('tuple')
        return payloads?.pop() ?? null
      }),
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

  public async find<R extends XyoPayload = XyoPayload>(filter: XyoPayloadFindFilter): Promise<R[]> {
    const [payloads = []] = await this.api.archive(this.archive).payload.find(filter, 'tuple')
    const [blocks = []] = await this.api.archive(this.archive).block.find(filter, 'tuple')
    return payloads.concat(blocks) as R[]
  }
}
