import { assertEx } from '@xylabs/sdk-js'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import LruCache from 'lru-cache'

import { XyoArchivistBase } from './XyoArchivist'
import { XyoPayloadFindQuery } from './XyoPayloadFindFilter'

export class XyoMemoryArchivist extends XyoArchivistBase<XyoPayload> {
  private cache = new LruCache<string, XyoPayload>({ max: 10000 })

  public delete(hashes: string[]): boolean[] | Promise<boolean[]> {
    return hashes.map((hash) => {
      return this.cache.delete(hash)
    })
  }

  public clear(): void | Promise<void> {
    this.cache.clear()
  }

  public async get(hashes: string[]): Promise<(XyoPayload | null)[]> {
    return await Promise.all(
      hashes.map(async (hash) => {
        return this.cache.get(hash) ?? (await this.parent?.get([hash]))?.pop() ?? null
      })
    )
  }

  public insert(payloads: XyoPayload[]): XyoPayload[] | Promise<XyoPayload[]> {
    return payloads.map((payload) => {
      const wrapper = new XyoPayloadWrapper(payload)
      const payloadWithmeta = { ...payload, _hash: wrapper.hash, _timestamp: Date.now() }
      this.cache.set(payloadWithmeta._hash, payloadWithmeta)
      return payloadWithmeta
    })
  }

  public find<R extends XyoPayload = XyoPayload>(query: XyoPayloadFindQuery): R[] | Promise<R[]> {
    const result: R[] = []
    this.cache.forEach((value) => {
      if (value.schema === query.filter.schema) {
        result.push(value as R)
      }
    })
    return result
  }

  public async commit() {
    const parent = assertEx(this.parent, 'Parent is required for commit')
    const account = assertEx(this.account, 'Account is required for commit')
    const payloads = assertEx(await this.all(), 'Nothing to commit')
    const builder = new XyoBoundWitnessBuilder<XyoBoundWitness, XyoPayload>()
    const block = builder.payloads(payloads).witness(account).build()
    const result = await parent.insert?.(payloads.concat([block]))
    await this.clear()
    return result
  }
}
