import { assertEx } from '@xylabs/assert'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistGetQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistInstance,
  ArchivistModule,
  ArchivistModuleEventData,
  ArchivistParams,
  ArchivistQuery,
  ArchivistQueryBase,
  asArchivistInstance,
  isArchivistInstance,
} from '@xyo-network/archivist-model'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { AbstractModuleInstance, duplicateModules, ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable, PromisableArray } from '@xyo-network/promise'
import compact from 'lodash/compact'

export interface ArchivistParentInstances {
  commit?: Record<string, ArchivistInstance>
  read?: Record<string, ArchivistInstance>
  write?: Record<string, ArchivistInstance>
}

export abstract class AbstractArchivist<
    TParams extends ArchivistParams = ArchivistParams,
    TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  >
  extends AbstractModuleInstance<TParams, TEventData>
  implements ArchivistModule<TParams>
{
  private _lastInsertedPayload: Payload | undefined
  private _parents?: ArchivistParentInstances

  override get queries(): string[] {
    return [ArchivistGetQuerySchema, ...super.queries]
  }

  get requireAllParents() {
    return this.config.requireAllParents ?? true
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
    return this.busy(async () => {
      await this.started('throw')
      return await this.allHandler()
    })
  }

  clear(): Promisable<void> {
    return this.busy(async () => {
      await this.started('throw')
      return await this.clearHandler()
    })
  }

  commit(): Promisable<BoundWitness[]> {
    return this.busy(async () => {
      await this.started('throw')
      return await this.commitHandler()
    })
  }

  delete(hashes: string[]): PromisableArray<Payload> {
    return this.busy(async () => {
      await this.started('throw')
      return await this.deleteHandler(hashes)
    })
  }

  get(hashes: string[]): Promise<Payload[]> {
    return this.busy(async () => {
      await this.started('throw')
      return await this.getHandler(hashes)
    })
  }

  insert(payloads: Payload[]): PromisableArray<Payload> {
    return this.busy(async () => {
      await this.started('throw')
      return await this.insertHandler(payloads)
    })
  }

  protected allHandler(): PromisableArray<Payload> {
    throw Error('Not implemented')
  }

  protected clearHandler(): Promisable<void> {
    throw Error('Not implemented')
  }

  protected commitHandler(): Promisable<BoundWitness[]> {
    throw Error('Not implemented')
  }

  protected deleteHandler(_hashes: string[]): PromisableArray<Payload> {
    throw Error('Not implemented')
  }

  protected async getFromParent(hashes: string[], archivist: ArchivistInstance): Promise<[Payload[], string[]]> {
    const foundPairs = (
      await Promise.all(
        (await archivist.get(hashes)).map<Promise<[string, Payload]>>(async (payload) => [await PayloadHasher.hashAsync(payload), payload]),
      )
    ).filter(([hash]) => {
      const askedFor = hashes.includes(hash)
      if (!askedFor) {
        console.warn(`Parent returned payload with hash not asked for: ${hash}`)
        //throw Error(`Parent returned payload with hash not asked for: ${hash}`)
      }
      return askedFor
    })

    const foundHashes = foundPairs.map(([hash]) => hash)
    const foundPayloads = foundPairs.map(([, payload]) => payload)

    const notfound = hashes.filter((hash) => !foundHashes.includes(hash))
    return [foundPayloads, notfound]
  }

  protected async getFromParents(hashes: string[]): Promise<[Payload[], string[]]> {
    const parents = Object.values((await this.parents())?.read ?? {})
    let remainingHashes = hashes
    let parentIndex = 0
    let result: Payload[] = []

    //intentionally doing this serially
    while (parentIndex < parents.length && remainingHashes.length > 0) {
      const [found, notfound] = await this.getFromParent(remainingHashes, parents[parentIndex])
      result = [...result, ...found]
      remainingHashes = notfound
      parentIndex++
    }
    return [result, remainingHashes]
  }

  protected async getHandler(hashes: string[]): Promise<Payload[]> {
    const [result] = await this.getFromParents(hashes)
    return result
  }

  protected head(): Promisable<Payload | undefined> {
    return this._lastInsertedPayload
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
  ): Promise<ModuleQueryHandlerResult> {
    const wrappedQuery = QueryBoundWitnessWrapper.parseQuery<ArchivistQuery>(query, payloads)
    const queryPayload = await wrappedQuery.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    if (this.config.storeQueries) {
      await this.insertHandler([query])
    }

    switch (queryPayload.schema) {
      case ArchivistAllQuerySchema:
        resultPayloads.push(...(await this.allHandler()))
        break
      case ArchivistClearQuerySchema:
        await this.clearHandler()
        break
      case ArchivistCommitQuerySchema:
        resultPayloads.push(...(await this.commitHandler()))
        break
      case ArchivistDeleteQuerySchema:
        resultPayloads.push(...(await this.deleteHandler(wrappedQuery.payloadHashes)))
        break
      case ArchivistGetQuerySchema:
        if (queryPayload.hashes?.length) {
          resultPayloads.push(...(await this.getHandler(queryPayload.hashes)))
        } else {
          const head = await this.head()
          if (head) resultPayloads.push(head)
        }
        break
      case ArchivistInsertQuerySchema: {
        const payloads = await wrappedQuery.getPayloads()
        assertEx(await wrappedQuery.getPayloads(), `Missing payloads: ${JSON.stringify(wrappedQuery.payload(), null, 2)}`)
        const resolvedPayloads = await PayloadWrapper.filterExclude(payloads, await wrappedQuery.hashAsync())
        assertEx(resolvedPayloads.length === payloads.length, `Could not find some passed hashes [${resolvedPayloads.length} != ${payloads.length}]`)
        resultPayloads.push(...(await this.insertHandler(payloads)))
        // NOTE: There isn't an exact equivalence between what we get and what we store. Once
        // we move to returning only inserted Payloads(/hash) instead of a BoundWitness, we
        // can grab the actual last one
        this._lastInsertedPayload = resolvedPayloads[resolvedPayloads.length - 1]
        break
      }
      default:
        return await super.queryHandler(query, payloads)
    }
    return resultPayloads
  }

  protected async writeToParent(parent: ArchivistInstance, payloads: Payload[]) {
    return await parent.insert(payloads)
  }

  protected async writeToParents(payloads: Payload[]): Promise<Payload[]> {
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
    const archivistModules = [...(await this.resolve({ address: archivists })), ...(await this.resolve({ name: archivists }))].filter(
      duplicateModules,
    )

    assertEx(
      !this.requireAllParents || archivistModules.length === archivists.length,
      `Failed to find some archivists (set allRequired to false if ok): [${archivists.filter((archivist) =>
        archivistModules.map((module) => !(module.address === archivist || module.config.name === archivist)),
      )}]`,
    )

    return archivistModules.reduce<Record<string, ArchivistInstance>>((prev, module) => {
      prev[module.address] = asArchivistInstance(module, () => {
        isArchivistInstance(module, { log: console })
        return `Unable to cast resolved module to an archivist: [${module.address}, ${module.config.name}, ${module.config.schema})}]`
      })

      return prev
    }, {})
  }

  protected abstract insertHandler(item: Payload[]): PromisableArray<Payload>
}
