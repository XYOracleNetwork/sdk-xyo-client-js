import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistGetQuery,
  ArchivistGetQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistModule,
  ArchivistModuleEventData,
  ArchivistParams,
  ArchivistQuery,
  ArchivistQueryBase,
} from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModule, ModuleConfig, ModuleErrorBuilder, ModuleQueryResult, QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable, PromisableArray } from '@xyo-network/promise'
import compact from 'lodash/compact'

export interface XyoArchivistParentWrappers {
  commit?: Record<string, ArchivistWrapper>
  read?: Record<string, ArchivistWrapper>
  write?: Record<string, ArchivistWrapper>
}

export abstract class AbstractArchivist<
    TParams extends ArchivistParams = ArchivistParams,
    TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  >
  extends AbstractModule<TParams, TEventData>
  implements ArchivistModule<TParams>
{
  private _parents?: XyoArchivistParentWrappers

  override get queries(): string[] {
    return [ArchivistGetQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<ArchivistQueryBase['schema'], string> {
    return {
      'network.xyo.query.archivist.all': '1/1',
      'network.xyo.query.archivist.clear': '1/2',
      'network.xyo.query.archivist.commit': '1/3',
      'network.xyo.query.archivist.delete': '1/4',
      'network.xyo.query.archivist.get': '1/5',
      'network.xyo.query.archivist.insert': '1/6',
    }
  }

  protected get storeParentReads() {
    return !!this.config?.storeParentReads
  }

  all(): PromisableArray<Payload> {
    throw Error('Not implemented')
  }

  clear(): Promisable<void> {
    throw Error('Not implemented')
  }

  commit(): Promisable<BoundWitness[]> {
    throw Error('Not implemented')
  }

  delete(_hashes: string[]): PromisableArray<boolean> {
    throw Error('Not implemented')
  }

  async get(hashes: string[]): Promise<Payload[]> {
    return compact(
      await Promise.all(
        hashes.map(async (hash) => {
          return (await this.getFromParents(hash)) ?? null
        }),
      ),
    )
  }

  head(): Promisable<Payload | undefined> {
    return
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
    return assertEx(this._parents)
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ArchivistQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
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
        case ArchivistGetQuerySchema:
          if (typedQuery?.hashes?.length) {
            resultPayloads.push(...(await this.get(typedQuery.hashes)))
          } else {
            const head = await this.head()
            if (head) resultPayloads.push(head)
          }
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
          return super.queryHandler(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new ModuleErrorBuilder().sources([wrapper.hash]).message(error.message).build())
    }
    return this.bindQueryResult(typedQuery, resultPayloads, [queryAccount])
  }

  protected async writeToParent(parent: ArchivistModule, payloads: Payload[]) {
    const wrapper = new ArchivistWrapper({ account: this.account, module: parent })
    return await wrapper.insert(payloads)
  }

  protected async writeToParents(payloads: Payload[]): Promise<BoundWitness[]> {
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
    const downResolvedModules = await this.downResolver.resolve({ address: archivists })
    const modules = [...resolvedModules, ...downResolvedModules] ?? []
    modules.forEach((module) => {
      const wrapper = new ArchivistWrapper({ account: this.account, module: module as ArchivistModule })
      resolvedWrappers[wrapper.address] = wrapper
    })
    return resolvedWrappers
  }

  abstract insert(item: Payload[]): PromisableArray<BoundWitness>
}
