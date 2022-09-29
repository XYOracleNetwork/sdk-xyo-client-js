import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import {
  ModuleQueryResult,
  QueryBoundWitnessWrapper,
  XyoModule,
  XyoModuleInitializeQuerySchema,
  XyoModuleShutdownQuerySchema,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promise'
import compact from 'lodash/compact'

import { PayloadArchivist } from './Archivist'
import { XyoArchivistConfig, XyoArchivistParents } from './Config'
import {
  XyoArchivistAllQuerySchema,
  XyoArchivistClearQuerySchema,
  XyoArchivistCommitQuerySchema,
  XyoArchivistDeleteQuerySchema,
  XyoArchivistFindQuerySchema,
  XyoArchivistGetQuery,
  XyoArchivistGetQuerySchema,
  XyoArchivistInsertQuery,
  XyoArchivistInsertQuerySchema,
  XyoArchivistQuery,
} from './Queries'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export abstract class XyoArchivist<TConfig extends XyoPayload = XyoPayload>
  extends XyoModule<XyoArchivistConfig<TConfig>>
  implements PayloadArchivist
{
  public override queries() {
    return [
      XyoModuleInitializeQuerySchema,
      XyoModuleShutdownQuerySchema,
      XyoArchivistGetQuerySchema,
      XyoArchivistInsertQuerySchema,
      ...super.queries(),
    ]
  }

  public get cacheParentReads() {
    return !!this.config?.cacheParentReads
  }

  public get writeThrough() {
    return !!this.config?.writeThrough
  }

  public all(): PromisableArray<XyoPayload> {
    throw Error('Not implemented')
  }

  public clear(): Promisable<void> {
    throw Error('Not implemented')
  }

  public commit(): Promisable<XyoBoundWitness[]> {
    throw Error('Not implemented')
  }

  public delete(_hashes: string[]): PromisableArray<boolean> {
    throw Error('Not implemented')
  }

  public find(_filter?: XyoPayloadFindFilter): PromisableArray<XyoPayload> {
    throw Error('Not implemented')
  }

  abstract get(hashes: string[]): NullablePromisableArray<XyoPayload>

  abstract insert(item: XyoPayload[]): PromisableArray<XyoBoundWitness>

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(
    query: T,
    payloads?: XyoPayloads,
  ): Promise<ModuleQueryResult<XyoPayload>> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoArchivistQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(typedQuery.schema, wrapper.addresses))

    const resultPayloads: (XyoPayload | null)[] = []
    const queryAccount = new XyoAccount()
    switch (typedQuery.schema) {
      case XyoArchivistAllQuerySchema:
        resultPayloads.push(...(await this.all()))
        break
      case XyoArchivistClearQuerySchema:
        await this.clear()
        break
      case XyoArchivistCommitQuerySchema:
        resultPayloads.push(...(await this.commit()))
        break
      case XyoArchivistDeleteQuerySchema:
        await this.delete(typedQuery.hashes)
        break
      case XyoArchivistFindQuerySchema:
        resultPayloads.push(...(await this.find(typedQuery.filter)))
        break
      case XyoArchivistGetQuerySchema:
        resultPayloads.push(...(await this.get(typedQuery.hashes)))
        break
      case XyoArchivistInsertQuerySchema: {
        const wrappers = payloads?.map((payload) => PayloadWrapper.parse(payload)) ?? []
        assertEx(typedQuery.payloads, `Missing payloads: ${JSON.stringify(typedQuery, null, 2)}`)
        const resolvedWrappers = wrappers.filter((wrapper) => typedQuery.payloads.includes(wrapper.hash))
        assertEx(resolvedWrappers.length === typedQuery.payloads.length, 'Could not find some passed hashes')
        resultPayloads.push(...(await this.insert(resolvedWrappers.map((wrapper) => wrapper.payload))))
        break
      }
      default:
        return super.query(query, payloads)
    }
    return this.bindResult(resultPayloads, queryAccount)
  }

  private resolveArchivists(archivists?: Record<string, PayloadArchivist | null | undefined>) {
    const resolved: Record<string, PayloadArchivist | null | undefined> = {}
    if (archivists) {
      Object.entries(archivists).forEach(([key, value]) => {
        resolved[key] = value ?? (this.resolver?.(key) as unknown as PayloadArchivist) ?? null
      })
    }
    return resolved
  }

  protected async getFromParents(hash: string) {
    return compact(
      await Promise.all(
        Object.values(this.parents?.read ?? {}).map(async (parent) => {
          const queryPayload = PayloadWrapper.parse<XyoArchivistGetQuery>({ hashes: [hash], schema: XyoArchivistGetQuerySchema })
          const query = await this.bindQuery(queryPayload)
          const [, payloads] = (await parent?.query(query[0], query[1])) ?? []
          const wrapper = payloads?.[0] ? new PayloadWrapper(payloads?.[0]) : undefined
          if (wrapper && wrapper.hash !== hash) {
            console.warn(`Parent [${parent?.address}] returned payload with invalid hash [${hash} != ${wrapper.hash}]`)
            return null
          }
          return wrapper?.payload
        }),
      ),
    )[0]
  }

  protected async writeToParent(parent: PayloadArchivist, payloads: XyoPayload[]) {
    const queryPayload = PayloadWrapper.parse<XyoArchivistInsertQuery>({
      payloads: payloads.map((payload) => PayloadWrapper.hash(payload)),
      schema: XyoArchivistInsertQuerySchema,
    })
    const query = await this.bindQuery(queryPayload)
    const result = (await parent?.query(query[0], query[1])) ?? []
    return result[0]
  }

  protected async writeToParents(payloads: XyoPayload[]): Promise<XyoBoundWitness[]> {
    return compact(
      await Promise.all(
        Object.values(this.parents?.write ?? {}).map(async (parent) => {
          return parent ? await this.writeToParent(parent, payloads) : undefined
        }),
      ),
    )
  }

  private _parents?: XyoArchivistParents
  get parents() {
    this._parents = this._parents ?? {
      commit: this.resolveArchivists(this.config?.parents?.commit),
      read: this.resolveArchivists(this.config?.parents?.read),
      write: this.resolveArchivists(this.config?.parents?.write),
    }
    return assertEx(this._parents)
  }
}
