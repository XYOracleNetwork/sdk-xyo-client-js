import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import LruCache from 'lru-cache'

import { XyoArchivistBase } from './XyoArchivist'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export class XyoMemoryArchivist<T extends XyoPayload = XyoPayload> extends XyoArchivistBase<T> {
  private cache = new LruCache<string, T>({ max: 10000 })

  public delete(hash: string): boolean | Promise<boolean> {
    return this.cache.delete(hash)
  }

  public clear(): void | Promise<void> {
    this.cache.clear()
  }

  public get(hash: string): T | Promise<T | undefined> | undefined {
    return this.cache.get(hash) ?? this.parent?.get(hash)
  }

  public insert(payloads: T[]): T[] | Promise<T[]> {
    return payloads.map((payload) => {
      const wrapper = new XyoPayloadWrapper(payload)
      const payloadWithmeta = { ...payload, _hash: wrapper.hash, _timestamp: Date.now() }
      this.cache.set(payloadWithmeta._hash, payloadWithmeta)
      return payloadWithmeta
    })
  }

  public find<R extends T = T>(filter: XyoPayloadFindFilter): T[] | Promise<T[]> {
    const result: R[] = []
    this.cache.forEach((value) => {
      if (value.schema === filter.schema) {
        result.push(value as R)
      }
    })
    return result
  }
}
