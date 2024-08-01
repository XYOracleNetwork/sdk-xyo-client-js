import { exists } from '@xylabs/exists'
import { Hash } from '@xylabs/hex'
import { Base, BaseParams } from '@xylabs/object'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { asBoundWitness } from '@xyo-network/boundwitness-model'
import { Huri } from '@xyo-network/huri'
import { isAnyPayload, Payload } from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'

export interface PayloadWorkingSet {
  archivists?: ArchivistInstance[]
  huriEndpoints?: string[]
  payloads?: Payload[]
}

export interface BoundWitnessLoaderParams extends BaseParams {
  cache?: ArchivistInstance
  workingSet: PayloadWorkingSet
}

export class BoundWitnessLoader extends Base<BoundWitnessLoaderParams> {
  private _cache?: ArchivistInstance
  private _createCacheMutex = new Mutex()

  async load(hash: Hash | Hash[]): Promise<Payload[]> {
    if (Array.isArray(hash)) {
      return (await Promise.all(hash.map((h) => this.load(h)))).flat()
    }
    const bw = asBoundWitness(await this.getPayload(hash))
    if (bw) {
      const payloads = (await Promise.all(bw.payload_hashes.map((hash) => this.getPayload(hash)))).filter(exists)
      return [bw, ...payloads]
    }
    return []
  }

  private async getCache() {
    return await this._createCacheMutex.runExclusive(async () => {
      this._cache = this._cache ?? this.params.cache ?? (await MemoryArchivist.create({ account: 'random' }))
      if (this.params.workingSet.payloads) await this._cache.insert(this.params.workingSet.payloads)
      return this._cache
    })
  }

  private async getPayload(hash: Hash): Promise<Payload | undefined> {
    const cache = await this.getCache()
    const payloadFromCache = (await cache.get([hash])).at(0)
    if (isAnyPayload(payloadFromCache)) {
      return payloadFromCache
    }

    for (const archivist of this.params.workingSet.archivists ?? []) {
      const payloadFromArchivist = await archivist.get([hash])
      if (isAnyPayload(payloadFromArchivist)) {
        cache.insert([payloadFromArchivist])
        return payloadFromArchivist
      }
    }

    for (const huriEndpoint of this.params.workingSet.huriEndpoints ?? []) {
      const payloadFromHuri = await new Huri(hash, { archivistUri: huriEndpoint }).fetch()
      if (isAnyPayload(payloadFromHuri)) {
        cache.insert([payloadFromHuri])
        return payloadFromHuri
      }
    }
  }
}
