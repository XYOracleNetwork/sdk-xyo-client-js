import { assertEx } from '@xylabs/sdk-js'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { Promisable, PromisableArray } from '@xyo-network/promisable'
import compact from 'lodash/compact'
import LruCache from 'lru-cache'

import { XyoAbstractArchivist } from './Abstract'
import { XyoArchivistQueryPayload } from './XyoArchivist'
import { XyoArchivistConfig } from './XyoArchivistConfig'
import { XyoPayloadFindQuery } from './XyoPayloadFindFilter'

export type XyoMemoryArchivistConfig = XyoArchivistConfig<{
  schema: 'network.xyo.module.config.archivist.memory'
  max?: number
}>

export class XyoMemoryArchivist<
  Q extends XyoArchivistQueryPayload = XyoArchivistQueryPayload,
  C extends XyoMemoryArchivistConfig = XyoMemoryArchivistConfig,
> extends XyoAbstractArchivist<Q, C> {
  query<Q>(_query: Q): Promisable<[XyoBoundWitness, XyoPayload<{ schema: string }>[]]> {
    throw new Error('Method not implemented.')
  }
  public get max() {
    return this.config?.max ?? 10000
  }

  private cache: LruCache<string, XyoPayload>

  constructor(config: C) {
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

  public async getFromParents(hash: string) {
    return compact(
      await Promise.all(
        compact(
          Object.values(this.parents?.read ?? {}).map(async (parent) => {
            return (await parent?.get([hash]))?.[0] ?? null
          }),
        ),
      ),
    )[0]
  }

  public async get(hashes: string[]): Promise<(XyoPayload | null)[]> {
    return await Promise.all(
      hashes.map(async (hash) => {
        return this.cache.get(hash) ?? (await this.getFromParents(hash)) ?? null
      }),
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
    const account = assertEx(this.account, 'Account is required for commit')
    const payloads = assertEx(await this.all(), 'Nothing to commit')
    const builder = new XyoBoundWitnessBuilder<XyoBoundWitness, XyoPayload>()
    const block = builder.payloads(payloads).witness(account).build()
    const result = await Promise.all(
      compact(Object.values(this.parents?.commit ?? [])?.map(async (parent) => await parent?.insert?.(payloads.concat([block])))),
    )
    await this.clear()
    return result
  }
}
