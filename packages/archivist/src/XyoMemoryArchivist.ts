import { XyoBoundWitnessWithMeta, XyoBoundWitnessWrapper } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWithPartialMeta, XyoPayloadWrapper } from '@xyo-network/payload'
import LruCache from 'lru-cache'

import { XyoArchivist } from './XyoArchivist'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export class XyoMemoryArchivist extends XyoArchivist {
  private cache: LruCache<string, XyoPayloadWithPartialMeta> = new LruCache<string, XyoPayloadWithPartialMeta>({ max: 10000 })

  public delete(hash: string) {
    return this.cache.delete(hash)
  }

  public clear() {
    this.cache.clear()
  }

  public get(hash: string) {
    return this.cache.get(hash) ?? this.parent?.get(hash)
  }

  public insert(payload: XyoBoundWitnessWithMeta) {
    const wrapper = new XyoBoundWitnessWrapper(payload)
    const payloadWithmeta = { ...payload, _hash: wrapper.hash, _timestamp: Date.now() }
    const hashes: string[] = []
    hashes.push(payloadWithmeta._hash)
    this.cache.set(payloadWithmeta._hash, payloadWithmeta)
    payload._payloads?.forEach((payload) => {
      const wrapper = new XyoPayloadWrapper(payload)
      const payloadWithmeta = { ...payload, _hash: wrapper.hash, _timestamp: Date.now() }
      hashes.push(payloadWithmeta._hash)
      this.cache.set(payloadWithmeta._hash, payloadWithmeta)
    })
    return hashes
  }

  public find<T extends XyoPayload = XyoPayload>(filter: XyoPayloadFindFilter): T[] {
    const result: T[] = []
    if (filter.type === 'schema') {
      const filterSchema = filter.schema !== undefined ? (Array.isArray(filter.schema) ? filter.schema : [filter.schema]) : undefined
      this.cache.forEach((value) => {
        let match: XyoPayload | undefined = value
        match = filterSchema === undefined || filterSchema.includes(value.schema) ? value : undefined
        if (match) {
          result.push(match as T)
        }
      })
    }
    if (filter.type === 'hash') {
      const filterHash = filter.hash !== undefined ? (Array.isArray(filter.hash) ? filter.hash : [filter.hash]) : undefined
      this.cache.forEach((value) => {
        let match: XyoPayload | undefined = value
        match = filterHash === undefined || filterHash.includes(new XyoPayloadWrapper(value).hash) ? value : undefined
        if (match) {
          result.push(match as T)
        }
      })
    }
    return result
  }
}
