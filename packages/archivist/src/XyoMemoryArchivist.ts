import { assertEx } from '@xylabs/sdk-js'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import LruCache from 'lru-cache'

import { PromisableArray } from './model'
import { XyoArchivist } from './XyoArchivist'
import { XyoArchivistConfig, XyoArchivistConfigWrapper } from './XyoArchivistConfig'
import { XyoPayloadFindQuery } from './XyoPayloadFindFilter'

export interface XyoMemoryArchivistConfig<T extends XyoPayload = XyoPayload> extends XyoArchivistConfig<T> {
  max?: number
}

export class XyoMemoryArchivist<C extends XyoMemoryArchivistConfig<XyoPayload> = XyoMemoryArchivistConfig<XyoPayload>>
  extends XyoArchivistConfigWrapper<XyoPayload, C>
  implements XyoArchivist
{
  public get max() {
    return this.config?.max ?? 10000
  }

  private cache: LruCache<string, XyoPayload>

  constructor(config?: C) {
    super(config)
    this.cache = new LruCache<string, XyoPayload>({ max: this.max })
  }

  public delete(hashes: string[]): PromisableArray<boolean> {
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

  public insert(payloads: XyoPayload[]): PromisableArray<XyoPayload> {
    return payloads.map((payload) => {
      const wrapper = new XyoPayloadWrapper(payload)
      const payloadWithmeta = { ...payload, _hash: wrapper.hash, _timestamp: Date.now() }
      this.cache.set(payloadWithmeta._hash, payloadWithmeta)
      return payloadWithmeta
    })
  }

  public find<R extends XyoPayload = XyoPayload>(query: XyoPayloadFindQuery): PromisableArray<R> {
    const result: R[] = []
    this.cache.forEach((value) => {
      if (value.schema === query.filter.schema) {
        result.push(value as R)
      }
    })
    return result
  }

  public all(): Promise<XyoPayload[]> | XyoPayload[] {
    return this.cache.dump().map((value) => value[1].value)
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
