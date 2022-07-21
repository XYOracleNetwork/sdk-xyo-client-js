import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import LruCache from 'lru-cache'

import { XyoArchivist } from './XyoArchivist'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export class XyoMemoryArchivist<TRead extends XyoPayload = XyoPayload, TWrite extends XyoPayload & TRead = XyoPayload & TRead> extends XyoArchivist<TRead, TWrite> {
  private cache: LruCache<string, TRead> = new LruCache<string, TRead>({ max: 10000 })

  public delete(hash: string) {
    return this.cache.delete(hash)
  }

  public clear() {
    this.cache.clear()
  }

  public get(hash: string) {
    const localResult = this.cache.get(hash)
    return localResult ? [localResult] : this.parent?.get(hash)
  }

  public insert(payload: TWrite) {
    const wrapper = new XyoPayloadWrapper(payload)
    const payloadWithmeta = { ...payload, _hash: wrapper.hash, _timestamp: Date.now() }
    this.cache.set(payloadWithmeta._hash, payloadWithmeta)
    return [payloadWithmeta._hash]
  }

  public find<T extends XyoPayload = XyoPayload>(filter: XyoPayloadFindFilter): T[] {
    return [this.cache.find((value) => value.schema === filter.schema)]
  }
}
