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

export interface ArchivistParentWrappers {
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
  private _lastInsertedPayload: Payload | undefined
  private _parents?: ArchivistParentWrappers

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
    return this._lastInsertedPayload
  }

  protected async getFromParents(hash: string) {
    const parents = await this.parents()
    if (Object.entries(parents.read ?? {}).length > 0) {
      const results = compact(
        await Promise.all(
          Object.values(parents.read ?? {}).map(async (parent) => {
            const queryPayload = PayloadWrapper.wrap<ArchivistGetQuery>({ hashes: [hash], schema: ArchivistGetQuerySchema })
            const query = await this.bindQuery(queryPayload)
            const [, payloads] = (await parent?.query(query[0], query[1])) ?? []
            const wrapper = payloads?.[0] ? PayloadWrapper.wrap(payloads?.[0]) : undefined
            if (wrapper && (await wrapper.hashAsync()) !== hash) {
              console.warn(`Parent [${parent?.address}] returned payload with invalid hash [${hash} != ${wrapper.hashAsync()}]`)
              return null
            }
            return wrapper?.payload()
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
    const wrappedQuery = QueryBoundWitnessWrapper.parseQuery<ArchivistQuery>(query, payloads)
    const queryPayload = await wrappedQuery.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    const queryAccount = Account.random()
    if (this.config.storeQueries) {
      await this.insert([query])
    }
    try {
      switch (queryPayload.schema) {
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
          await this.delete(wrappedQuery.payloadHashes)
          break
        case ArchivistGetQuerySchema:
          if (queryPayload.hashes?.length) {
            resultPayloads.push(...(await this.get(queryPayload.hashes)))
          } else {
            const head = await this.head()
            if (head) resultPayloads.push(head)
          }
          break
        case ArchivistInsertQuerySchema: {
          const payloads = await wrappedQuery.getPayloads()
          assertEx(await wrappedQuery.getPayloads(), `Missing payloads: ${JSON.stringify(wrappedQuery.payload(), null, 2)}`)
          const resolvedPayloads = await PayloadWrapper.filterExclude(payloads, await wrappedQuery.hashAsync())
          assertEx(
            resolvedPayloads.length === payloads.length,
            `Could not find some passed hashes [${resolvedPayloads.length} != ${payloads.length}]`,
          )
          resultPayloads.push(...(await this.insert(payloads)))
          // NOTE: There isn't an exact equivalence between what we get and what we store. Once
          // we move to returning only inserted Payloads(/hash) instead of a BoundWitness, we
          // can grab the actual last one
          this._lastInsertedPayload = resolvedPayloads[resolvedPayloads.length - 1]
          break
        }
        default:
          return super.queryHandler(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(
        new ModuleErrorBuilder()
          .sources([await wrappedQuery.hashAsync()])
          .message(error.message)
          .build(),
      )
    }
    return (await this.bindQueryResult(queryPayload, resultPayloads, [queryAccount]))[0]
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
    await Promise.all(
      modules.map((module) => {
        const wrapper = new ArchivistWrapper({ account: this.account, module: module as ArchivistModule })
        resolvedWrappers[wrapper.address] = wrapper
      }),
    )
    return resolvedWrappers
  }

  abstract insert(item: Payload[]): PromisableArray<BoundWitness>
}
