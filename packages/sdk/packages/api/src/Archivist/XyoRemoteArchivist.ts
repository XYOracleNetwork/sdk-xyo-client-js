import { assertEx } from '@xylabs/assert'
import { XyoArchivist, XyoArchivistFindQuerySchema } from '@xyo-network/archivist'
import { isXyoBoundWitnessPayload, XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModuleParams } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloadFindFilter } from '@xyo-network/payload'
import compact from 'lodash/compact'

import { RemoteArchivistError } from './RemoteArchivistError'
import { XyoRemoteArchivistConfig } from './XyoRemoteArchivistConfig'

/** @description Archivist Context that connects to a remote archivist using the API */
export class XyoRemoteArchivist extends XyoArchivist<XyoRemoteArchivistConfig> {
  static override async create(params?: XyoModuleParams<XyoRemoteArchivistConfig>): Promise<XyoRemoteArchivist> {
    params?.logger?.debug(`params: ${JSON.stringify(params, null, 2)}`)
    const module = new XyoRemoteArchivist(params)
    await module.start()
    return module
  }

  public get api() {
    return assertEx(this.config?.api, 'API not defined')
  }

  public override queries() {
    return [XyoArchivistFindQuerySchema, ...super.queries()]
  }

  public get archive() {
    return this.config?.archive
  }

  public async get(hashes: string[]): Promise<XyoPayload[]> {
    return compact(
      await Promise.all(
        hashes.map(async (hash) => {
          try {
            const [payloads, response, error] = await this.api.archive(this.archive).payload.hash(hash).get('tuple')
            if (error?.status >= 400) {
              throw new RemoteArchivistError('get', `${error.statusText} [${error.status}]`)
            }
            if (response?.error?.length) {
              throw new RemoteArchivistError('get', response?.error)
            }
            return payloads?.pop()
          } catch (ex) {
            console.error(ex)
            throw ex
          }
        }),
      ),
    )
  }

  public async insert(payloads: XyoPayload[]): Promise<XyoBoundWitness[]> {
    try {
      const boundWitnesses: XyoBoundWitness[] = payloads.filter(isXyoBoundWitnessPayload)
      boundWitnesses.forEach((boundwitness) => {
        // doing this here to prevent breaking code (for now)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyBoundwitness: any = boundwitness
        anyBoundwitness._payloads ===
          payloads.filter((payload) => {
            const hash = new PayloadWrapper(payload).hash
            return boundwitness.payload_hashes.includes(hash)
          })
      })
      const [boundwitness] = await this.bindResult(payloads)
      const bwWithMeta: XyoBoundWitness & { _payloads: XyoPayload[] } = { ...boundwitness, _payloads: payloads }
      const bwResult = await this.api.archive(this.archive).block.post([bwWithMeta], 'tuple')
      const [, response, error] = bwResult
      if (error?.status >= 400) {
        throw new RemoteArchivistError('insert', `${error.statusText} [${error.status}]`)
      }
      if (response?.error?.length) {
        throw new RemoteArchivistError('insert', response?.error)
      }
      return [boundwitness]
    } catch (ex) {
      console.error(ex)
      throw ex
    }
  }

  public override async find<R extends XyoPayload = XyoPayload>(filter: XyoPayloadFindFilter): Promise<R[]> {
    try {
      const [payloads = [], payloadEnvelope, payloadResponse] = await this.api.archive(this.archive).payload.find(filter, 'tuple')
      if (payloadEnvelope.error?.length) {
        throw new RemoteArchivistError('find', payloadEnvelope.error.shift(), 'payloads')
      }
      if (payloadResponse.status >= 300) {
        throw new RemoteArchivistError('find', `Invalid payload status [${payloadResponse.status}]`, 'payloads')
      }
      const [blocks = [], blockEnvelope, blockResponse] = await this.api.archive(this.archive).block.find(filter, 'tuple')
      if (blockEnvelope.error?.length) {
        throw new RemoteArchivistError('find', blockEnvelope.error.shift(), 'payloads')
      }
      if (blockResponse.status >= 300) {
        throw new RemoteArchivistError('find', `Invalid block status [${blockResponse.status}]`, 'payloads')
      }
      return payloads.concat(blocks) as R[]
    } catch (ex) {
      console.error(ex)
      throw ex
    }
  }
}
