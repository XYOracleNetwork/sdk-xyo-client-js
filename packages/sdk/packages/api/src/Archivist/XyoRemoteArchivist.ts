import { assertEx } from '@xylabs/sdk-js'
import { XyoArchivist, XyoArchivistFindQuerySchema, XyoPayloadFindFilter } from '@xyo-network/archivist'
import { XyoBoundWitness, XyoBoundWitnessSchema, XyoBoundWitnessWithMeta, XyoBoundWitnessWithPartialMeta } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'

import { RemoteArchivistError } from './RemoteArchivistError'
import { XyoRemoteArchivistConfig } from './XyoRemoteArchivistConfig'

/** @description Archivist Context that connects to a remote archivist using the API */
export class XyoRemoteArchivist extends XyoArchivist<XyoRemoteArchivistConfig> {
  public get api() {
    return assertEx(this.config?.api, 'API not defined')
  }

  public override queries() {
    return [XyoArchivistFindQuerySchema, ...super.queries()]
  }

  public get archive() {
    return this.config?.archive
  }

  public async get(hashes: string[]) {
    return await Promise.all(
      hashes.map(async (hash) => {
        try {
          const [payloads, { error }] = await this.api.archive(this.archive).payload.hash(hash).get('tuple')
          if (error?.length) {
            throw new RemoteArchivistError('get', error)
          }
          return payloads?.pop() ?? null
        } catch (ex) {
          console.error(ex)
          throw ex
        }
      }),
    )
  }

  public async insert(payloads: XyoPayload[]): Promise<XyoBoundWitness> {
    try {
      const boundwitnesses = payloads.filter((payload) => payload.schema === XyoBoundWitnessSchema) as XyoBoundWitnessWithPartialMeta[]
      boundwitnesses.forEach((boundwitness) => {
        boundwitness._payloads ===
          payloads.filter((payload) => {
            const hash = new XyoPayloadWrapper(payload).hash
            return boundwitness.payload_hashes.includes(hash)
          })
      })
      const [boundwitness] = await this.bindPayloads(payloads)
      const bwWithMeta: Partial<XyoBoundWitnessWithMeta> & XyoBoundWitness = { ...boundwitness, _payloads: payloads }
      const bwResult = await this.api.archive(this.archive).block.post([bwWithMeta], 'tuple')
      const [, { error: bwError }] = bwResult
      if (bwError?.length) {
        throw new RemoteArchivistError('insert', bwError)
      }
      return boundwitness
    } catch (ex) {
      console.error(ex)
      throw ex
    }
  }

  public async find<R extends XyoPayload = XyoPayload>(filter: XyoPayloadFindFilter): Promise<R[]> {
    try {
      const [payloads = [], { error: payloadError }] = await this.api.archive(this.archive).payload.find(filter, 'tuple')
      if (payloadError?.length) {
        throw new RemoteArchivistError('find', payloadError, 'payloads')
      }
      const [blocks = [], { error: blockError }] = await this.api.archive(this.archive).block.find(filter, 'tuple')
      if (blockError?.length) {
        throw new RemoteArchivistError('find', blockError, 'blocks')
      }
      return payloads.concat(blocks) as R[]
    } catch (ex) {
      console.error(ex)
      throw ex
    }
  }
}
