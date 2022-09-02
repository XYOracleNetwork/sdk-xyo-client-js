import { assertEx } from '@xylabs/sdk-js'
import { XyoArchivist, XyoArchivistFindQueryPayloadSchema, XyoPayloadFindFilter } from '@xyo-network/archivist'
import { XyoBoundWitnessSchema, XyoBoundWitnessWithPartialMeta } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoRemoteArchivistConfig } from './XyoRemoteArchivistConfig'

class RemoteArchivistError extends Error {
  constructor(action: string, error: Error['cause'], message?: string) {
    super(`Remote Archivist [${action}] failed${message ? ` (${message})` : ''}`, { cause: error })
  }
}

/** @description Archivist Context that connects to a remote archivist using the API */
export class XyoRemoteArchivist extends XyoArchivist<XyoRemoteArchivistConfig> {
  public get api() {
    return assertEx(this.config?.api, 'API not defined')
  }

  public override get queries() {
    return [...super.queries, XyoArchivistFindQueryPayloadSchema]
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
          throw new RemoteArchivistError('get', ex, 'unexpected')
        }
      }),
    )
  }

  public async insert(payloads: XyoPayload[]) {
    try {
      const boundwitnesses = payloads.filter((payload) => payload.schema === XyoBoundWitnessSchema) as XyoBoundWitnessWithPartialMeta[]
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
      const [, { error }] = await this.api.archive(this.archive).block.post(boundwitnesses, 'tuple')
      if (error?.length) {
        throw new RemoteArchivistError('insert', error)
      }
      return payloads
    } catch (ex) {
      throw new RemoteArchivistError('insert', ex, 'unexpected')
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
      throw new RemoteArchivistError('find', ex, 'unexpected')
    }
  }
}
