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
  ArchivistModule,
  ArchivistQuery,
} from '@xyo-network/archivist-interface'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModule, ModuleConfig, ModuleQueryResult, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoQueryBoundWitness } from '@xyo-network/module'
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
  implements ArchivistModule
{
  private _parents?: XyoArchivistParentWrappers

  override get queries(): string[] {
    return [ArchivistGetQuerySchema, ...super.queries]
  }

  protected get storeParentReads() {
    return !!this.config?.storeParentReads
  }

  all(): PromisableArray<XyoPayload> {
    throw Error('Not implemented')
  }

  clear(): Promisable<void> {
    throw Error('Not implemented')
  }

  commit(): Promisable<XyoBoundWitness[]> {
    throw Error('Not implemented')
  }

  delete(_hashes: string[]): PromisableArray<boolean> {
    throw Error('Not implemented')
  }

  /** @deprecated use Diviners instead */
  async find(filter?: PayloadFindFilter): Promise<XyoPayload[]> {
    try {
      const filterSchemaList = filter?.schema ? (Array.isArray(filter.schema) ? filter.schema : [filter.schema]) : []
      return (await this.all()).filter((payload) => filterSchemaList.includes(payload.schema))
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  async get(hashes: string[]): Promise<XyoPayload[]> {
    return compact(
      await Promise.all(
        hashes.map(async (hash) => {
          return (await this.getFromParents(hash)) ?? null
        }),
      ),
    )
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ArchivistQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: XyoPayload[] = []
    const queryAccount = new Account()
    if (this.config.storeQueries) {
      await this.insert([query])
    }
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
    return this.bindResult(resultPayloads, queryAccount)
  }

  protected async getFromParents(hash: string) {
    const parents = await this.parents()
    if (Object.entries(parents.read ?? {}).length > 0) {
      const results = compact(
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
      )
      return results[0]
    }
    return null
  }

  protected async parents() {
    this._parents = this._parents ?? {
      commit: await this.resolveArchivists(this.config?.parents?.commit),
      read: await this.resolveArchivists(this.config?.parents?.read),
      write: await this.resolveArchivists(this.config?.parents?.write),
    }
    console.log('parents', this._parents)
    return assertEx(this._parents)
  }

  protected async writeToParent(parent: ArchivistModule, payloads: XyoPayload[]) {
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

  private async resolveArchivists(archivists: string[] = []) {
    const resolvedWrappers: Record<string, ArchivistWrapper> = {}
    const resolvedModules = await this.resolve({ address: archivists })
    const downResolvedModules = await this.resolver.resolve({ address: archivists })
    const modules = [...resolvedModules, ...downResolvedModules] ?? []
    modules.forEach((module) => {
      const wrapper = new ArchivistWrapper(module)
      resolvedWrappers[wrapper.address] = wrapper
    })
    return resolvedWrappers
  }

  abstract insert(item: XyoPayload[]): PromisableArray<XyoBoundWitness>
}
