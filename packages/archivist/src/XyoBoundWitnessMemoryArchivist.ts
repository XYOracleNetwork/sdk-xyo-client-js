import { XyoBoundWitness, XyoBoundWitnessWithMeta, XyoBoundWitnessWrapper } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWithMeta, XyoPayloadWrapper } from '@xyo-network/payload'
import LruCache from 'lru-cache'

import { XyoBoundWitnessArchivist } from './XyoBoundWitnessArchivist'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export class XyoBoundWitnessMemoryArchivist<
  TRead extends XyoPayloadWithMeta = XyoPayloadWithMeta,
  TWrite extends XyoBoundWitnessWithMeta<XyoBoundWitness, TRead> & TRead = XyoBoundWitnessWithMeta<XyoBoundWitness, TRead> & TRead
> extends XyoBoundWitnessArchivist<TWrite, TRead> {
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

  public insert(boundWitness: TWrite) {
    const wrapper = new XyoBoundWitnessWrapper(boundWitness)
    const boundWitnessWithMeta = { ...boundWitness, _hash: wrapper.hash, _timestamp: Date.now() }
    const hashes: string[] = []
    hashes.push(boundWitnessWithMeta._hash)
    this.cache.set(boundWitnessWithMeta._hash, boundWitnessWithMeta)
    boundWitness._payloads?.forEach((payload) => {
      const wrapper = new XyoPayloadWrapper(payload)
      const payloadWithMeta: TRead = { ...payload, _hash: wrapper.hash, _timestamp: Date.now() }
      hashes.push(payloadWithMeta._hash)
      this.cache.set(payloadWithMeta._hash, payloadWithMeta)
    })
    return hashes
  }

  public find<T extends XyoPayload = XyoPayload>(_filter: XyoPayloadFindFilter): T[] {
    throw Error('find not supported')
  }
}
