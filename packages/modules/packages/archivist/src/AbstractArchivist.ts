import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistDeleteQuerySchema,
  ArchivistFindQuerySchema,
  ArchivistGetQuery,
  ArchivistGetQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistQuery,
  PayloadArchivist,
} from '@xyo-network/archivist-interface'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModule, ModuleQueryResult, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadFindFilter, XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable, PromisableArray } from '@xyo-network/promise'
import compact from 'lodash/compact'

export interface XyoArchivistParentWrappers {
  commit?: Record<string, ArchivistWrapper>
  read?: Record<string, ArchivistWrapper>
  write?: Record<string, ArchivistWrapper>
}

export abstract class AbstractArchivist<TConfig extends ArchivistConfig = ArchivistConfig>
  extends AbstractModule<TConfig>
  implements PayloadArchivist
{
  private _parents?: XyoArchivistParentWrappers

  protected get cacheParentReads() {
    return !!this.config?.cacheParentReads
  }

  protected get writeThrough() {
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

  public async find(filter?: PayloadFindFilter): Promise<XyoPayload[]> {
    try {
      const filterSchemaList = filter?.schema ? (Array.isArray(filter.schema) ? filter.schema : [filter.schema]) : []
      return (await this.all()).filter((payload) => filterSchemaList.includes(payload.schema))
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  public override queries() {
    return [ArchivistGetQuerySchema, ...super.queries()]
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(
    query: T,
    payloads?: XyoPayload[],
  ): Promise<ModuleQueryResult<XyoPayload>> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ArchivistQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query, payloads))

    const resultPayloads: XyoPayload[] = []
    const queryAccount = new Account()
    try {
      switch (typedQuery.schema) {
        case ArchivistAllQuerySchema:
          resultPayloads.push(...(await this.all()))
          break
        case ArchivistClearQuerySchema:
          await this.clear()
          break
        case ArchivistCommitQuerySchema:
          resultPayloads.push(...(await this.commit()))
          break
        case ArchivistDeleteQuerySchema:
          await this.delete(typedQuery.hashes)
          break
        case ArchivistFindQuerySchema:
          resultPayloads.push(...(await this.find(typedQuery.filter)))
          break
        case ArchivistGetQuerySchema:
          resultPayloads.push(...(await this.get(typedQuery.hashes)))
          break
        case ArchivistInsertQuerySchema: {
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
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new XyoErrorBuilder([wrapper.hash], error.message).build())
    }
    this.logger?.log(wrapper.schemaName)
    return this.bindResult(resultPayloads, queryAccount)
  }

  protected async getFromParents(hash: string) {
    const parents = await this.parents()
    return compact(
      await Promise.all(
        Object.values(parents.read ?? {}).map(async (parent) => {
          const queryPayload = PayloadWrapper.parse<ArchivistGetQuery>({ hashes: [hash], schema: ArchivistGetQuerySchema })
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

  protected async parents() {
    this._parents = this._parents ?? {
      commit: await this.resolveArchivists(this.config?.parents?.commit),
      read: await this.resolveArchivists(this.config?.parents?.read),
      write: await this.resolveArchivists(this.config?.parents?.write),
    }
    return assertEx(this._parents)
  }

  protected async writeToParent(parent: PayloadArchivist, payloads: XyoPayload[]) {
    const wrapper = new ArchivistWrapper(parent)
    return await wrapper.insert(payloads)
  }

  protected async writeToParents(payloads: XyoPayload[]): Promise<XyoBoundWitness[]> {
    const parents = await this.parents()
    this.logger?.log(parents.write?.length ?? 0)
    return compact(
      await Promise.all(
        Object.values(parents.write ?? {}).map(async (parent) => {
          return parent ? await this.writeToParent(parent, payloads) : undefined
        }),
      ),
    ).flat()
  }

  private async resolveArchivists(archivists?: string[]) {
    const resolvedWrappers: Record<string, ArchivistWrapper> = {}
    const modules = (await this.resolver?.resolve({ address: archivists })) ?? []
    modules.forEach((module) => {
      const wrapper = new ArchivistWrapper(module)
      resolvedWrappers[wrapper.address] = wrapper
    })
    return resolvedWrappers
  }

  abstract get(hashes: string[]): PromisableArray<XyoPayload>

  abstract insert(item: XyoPayload[]): PromisableArray<XyoBoundWitness>
}
