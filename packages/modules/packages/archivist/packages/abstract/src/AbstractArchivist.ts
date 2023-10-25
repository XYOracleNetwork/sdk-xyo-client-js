import { assertEx } from '@xylabs/assert'
import { compact } from '@xylabs/lodash'
import { Promisable, PromisableArray } from '@xylabs/promise'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuery,
  ArchivistDeleteQuerySchema,
  ArchivistGetQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistInstance,
  ArchivistModuleEventData,
  ArchivistParams,
  ArchivistQuery,
  ArchivistQueryBase,
  asArchivistInstance,
  isArchivistInstance,
} from '@xyo-network/archivist-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { BoundWitness, BoundWitnessSchema, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import { duplicateModules, ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export interface ActionConfig {
  emitEvents?: boolean
}

export interface InsertConfig extends ActionConfig {
  writeToParents?: boolean
}

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
  implements ArchivistInstance<TParams>
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
    this._noOverride('all')
    return this.busy(async () => {
      await this.started('throw')
      return await this.allHandler()
    })
  }

  clear(): Promisable<void> {
    this._noOverride('clear')
    return this.busy(async () => {
      await this.started('throw')
      return await this.clearHandler()
    })
  }

  commit(): Promisable<BoundWitness[]> {
    this._noOverride('commit')
    return this.busy(async () => {
      await this.started('throw')
      return await this.commitHandler()
    })
  }

  async delete(hashes: string[]): Promise<string[]> {
    this._noOverride('delete')
    return await this.busy(async () => {
      await this.started('throw')
      return await this.deleteWithConfig(hashes)
    })
  }

  async get(hashes: string[]): Promise<Payload[]> {
    this._noOverride('get')
    return await this.busy(async () => {
      await this.started('throw')
      return await this.getWithConfig(hashes)
    })
  }

  async insert(payloads: Payload[]): Promise<Payload[]> {
    this._noOverride('insert')
    return await this.busy(async () => {
      await this.started('throw')
      return await this.insertWithConfig(payloads)
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

  protected deleteHandler(_hashes: string[]): PromisableArray<string> {
    throw Error('Not implemented')
  }

  protected async deleteWithConfig(hashes: string[], config?: ActionConfig): Promise<string[]> {
    const emitEvents = config?.emitEvents ?? true

    const deletedHashes = await this.deleteHandler(hashes)

    if (emitEvents) {
      await this.emit('deleted', { hashes: deletedHashes, module: this })
    }

    return deletedHashes
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
    let remainingHashes = [...hashes]
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

  protected getHandler(_hashes: string[]): Promisable<Payload[]> {
    throw Error('Not implemented')
  }

  protected async getWithConfig(hashes: string[], config?: InsertConfig): Promise<Payload[]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const emitEvents = config?.emitEvents ?? true
    const map = await PayloadWrapper.toMap(await this.getHandler(hashes))

    const { foundPayloads, notfoundHashes } = hashes.reduce<{ foundPayloads: Payload[]; notfoundHashes: string[] }>(
      (prev, hash) => {
        const found = map[hash]
        if (found) {
          //TODO: Find a better way to scrub meta data without scrubbing _signatures
          if (found.schema === BoundWitnessSchema) {
            prev.foundPayloads.push({ ...PayloadHasher.hashFields(found), ...{ _signatures: (found as BoundWitness)._signatures } } as BoundWitness)
          } else {
            prev.foundPayloads.push({ ...PayloadHasher.hashFields(found) } as Payload)
          }
        } else {
          prev.notfoundHashes.push(hash)
        }
        return prev
      },
      { foundPayloads: [], notfoundHashes: [] },
    )

    const [parentFoundPayloads] = await this.getFromParents(notfoundHashes)

    if (this.storeParentReads) {
      await this.insertWithConfig(parentFoundPayloads)
    }
    return [...foundPayloads, ...parentFoundPayloads]
  }

  protected head(): Promisable<Payload | undefined> {
    return this._lastInsertedPayload
  }

  protected insertHandler(_payloads: Payload[]): Promise<Payload[]> {
    throw Error('Not implemented')
  }

  protected async insertWithConfig(payloads: Payload[], config?: InsertConfig): Promise<Payload[]> {
    const emitEvents = config?.emitEvents ?? true
    const writeToParents = config?.writeToParents ?? true

    const insertedPayloads = await this.insertHandler(payloads)

    if (writeToParents) {
      await this.writeToParents(insertedPayloads)
    }
    if (emitEvents) {
      await this.emit('inserted', { module: this, payloads: insertedPayloads })
    }

    return insertedPayloads
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
      case ArchivistDeleteQuerySchema: {
        const resultPayload: ArchivistDeleteQuery = {
          hashes: [...(await this.deleteWithConfig(queryPayload.hashes))],
          schema: ArchivistDeleteQuerySchema,
        }
        resultPayloads.push(resultPayload)
        break
      }
      case ArchivistGetQuerySchema:
        if (queryPayload.hashes?.length) {
          resultPayloads.push(...(await this.getWithConfig(queryPayload.hashes)))
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
        resultPayloads.push(...(await this.insertWithConfig(payloads)))
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
}
