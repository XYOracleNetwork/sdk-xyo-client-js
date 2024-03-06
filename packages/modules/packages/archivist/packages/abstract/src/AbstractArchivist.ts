import { assertEx } from '@xylabs/assert'
import { Address, Hash } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { Promisable, PromisableArray } from '@xylabs/promise'
import { difference } from '@xylabs/set'
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
  ArchivistNextOptions,
  ArchivistParams,
  ArchivistQueries,
  asArchivistInstance,
  isArchivistInstance,
} from '@xyo-network/archivist-model'
import { BoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import { duplicateModules, ModuleConfig, ModuleIdentifier, ModuleName, ModuleQueryHandlerResult } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadWithMeta, WithMeta } from '@xyo-network/payload-model'

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
  implements ArchivistInstance<TParams, TEventData, Payload>
{
  private _lastInsertedPayload: Payload | undefined
  private _parents?: ArchivistParentInstances

  override get queries(): string[] {
    return [ArchivistGetQuerySchema, ...super.queries]
  }

  get requireAllParents() {
    return this.config.requireAllParents ?? false
  }

  protected override get _queryAccountPaths(): Record<ArchivistQueries['schema'], string> {
    return {
      'network.xyo.query.archivist.all': '1/1',
      'network.xyo.query.archivist.clear': '1/2',
      'network.xyo.query.archivist.commit': '1/3',
      'network.xyo.query.archivist.delete': '1/4',
      'network.xyo.query.archivist.get': '1/5',
      'network.xyo.query.archivist.insert': '1/6',
      'network.xyo.query.archivist.next': '1/7',
    }
  }

  protected get storeParentReads() {
    return !!this.config?.storeParentReads
  }

  all(): PromisableArray<WithMeta<Payload>> {
    this._noOverride('all')
    return this.busy(async () => {
      await this.started('throw')
      return await PayloadBuilder.build(await this.allHandler())
    })
  }

  clear(): Promisable<void> {
    this._noOverride('clear')
    return this.busy(async () => {
      await this.started('throw')
      return await this.clearHandler()
    })
  }

  commit(): Promisable<WithMeta<BoundWitness>[]> {
    this._noOverride('commit')
    return this.busy(async () => {
      await this.started('throw')
      return await this.commitHandler()
    })
  }

  async delete(hashes: Hash[]): Promise<Hash[]> {
    this._noOverride('delete')
    return await this.busy(async () => {
      await this.started('throw')
      return await this.deleteWithConfig(hashes)
    })
  }

  async get(hashes: Hash[]): Promise<WithMeta<Payload>[]> {
    this._noOverride('get')
    return await this.busy(async () => {
      await this.started('throw')
      return await PayloadBuilder.build(await this.getWithConfig(hashes))
    })
  }

  async insert(payloads: Payload[]): Promise<WithMeta<Payload>[]> {
    this._noOverride('insert')
    return await this.busy(async () => {
      await this.started('throw')
      //make sure all incoming payloads have proper $hash and $meta
      return await this.insertWithConfig(payloads)
    })
  }

  async next?(options?: ArchivistNextOptions): Promise<WithMeta<Payload>[]> {
    this._noOverride('next')
    return await this.busy(async () => {
      await this.started('throw')
      return await this.nextWithConfig(options)
    })
  }

  protected allHandler(): PromisableArray<Payload> {
    throw new Error('Not implemented')
  }

  protected clearHandler(): Promisable<void> {
    throw new Error('Not implemented')
  }

  protected commitHandler(): Promisable<WithMeta<BoundWitness>[]> {
    throw new Error('Not implemented')
  }

  protected deleteHandler(_hashes: Hash[]): PromisableArray<Hash> {
    throw new Error('Not implemented')
  }

  protected async deleteWithConfig(hashes: Hash[], config?: ActionConfig): Promise<Hash[]> {
    const emitEvents = config?.emitEvents ?? true

    const deletedHashes = await this.deleteHandler(hashes)

    if (emitEvents) {
      await this.emit('deleted', { hashes: deletedHashes, module: this })
    }

    return deletedHashes
  }

  protected async getFromParent(hashes: Hash[], archivist: ArchivistInstance): Promise<[WithMeta<Payload>[], Hash[]]> {
    const foundPairs = (await PayloadBuilder.dataHashPairs((await archivist.get(hashes)) as WithMeta<Payload>[])).filter(([, hash]) => {
      const askedFor = hashes.includes(hash)
      if (!askedFor) {
        console.warn(`Parent returned payload with hash not asked for: ${hash}`)
        //throw Error(`Parent returned payload with hash not asked for: ${hash}`)
      }
      return askedFor
    })

    const foundHashes = new Set(foundPairs.map(([, hash]) => hash))
    const foundPayloads = foundPairs.map(([payload]) => payload)

    const notfound = hashes.filter((hash) => !foundHashes.has(hash))
    return [foundPayloads, notfound]
  }

  protected async getFromParents(hashes: Hash[]): Promise<[WithMeta<Payload>[], Hash[]]> {
    const parents = Object.values((await this.parents())?.read ?? {})
    let remainingHashes = [...hashes]
    let parentIndex = 0
    let result: WithMeta<Payload>[] = []

    // NOTE: intentionally doing this serially
    while (parentIndex < parents.length && remainingHashes.length > 0) {
      const [found, notfound] = await this.getFromParent(remainingHashes, parents[parentIndex])
      result = [...result, ...found]
      remainingHashes = notfound
      parentIndex++
    }
    return [result, remainingHashes]
  }

  protected getHandler(_hashes: Hash[]): Promisable<Payload[]> {
    throw new Error('Not implemented')
  }

  protected async getWithConfig(hashes: Hash[], _config?: InsertConfig): Promise<WithMeta<Payload>[]> {
    // Filter out duplicates
    const requestedHashes = new Set(hashes)

    // Attempt to find the payloads in the store
    const gotten = await this.getHandler([...requestedHashes])

    // Do not just blindly return what the archivist told us but
    // ensure to only return requested payloads and keep track of
    // the ones it did not find so we can ask the parents.
    const foundPayloads: PayloadWithMeta[] = []
    const foundHashes = new Set<Hash>()

    // NOTE: We are iterating over the returned result from the archivist
    // (not the array of hashes passed in) to preserve the natural order of the
    // hashes as returned by the archivist as that should loosely
    // correspond to the order when iterated and the symmetry will
    // be helpful for debugging
    for (const payload of gotten) {
      // Compute the hashes for this payload
      const map = await PayloadBuilder.toAllHashMap([payload])
      for (const [key, payload] of Object.entries(map)) {
        let requestedPayloadFound = false
        const hash = key as Hash // NOTE: Required cast as Object.entries always returns string keys
        // If this hash was requested
        if (
          requestedHashes.has(hash) && // Indicate that we found it (but do not insert it yet). Since
          // one payload could satisfy two requested hashes (vit its dataHash
          // & rootHash) we only want to insert that payload once but we want
          // to keep track of all the hashes it satisfies so we can ask th
          // parents for the ones we did not find
          !foundHashes.has(hash)
        ) {
          requestedPayloadFound = true
          // Add it to the list of found hashes
          foundHashes.add(hash)
        }
        if (requestedPayloadFound) foundPayloads.push(payload)
      }
    }
    // For all the hashes we did not find, ask the parents
    const notFoundHashes = [...difference(requestedHashes, foundHashes)]
    const [parentFoundPayloads] = await this.getFromParents(notFoundHashes)

    if (this.storeParentReads) {
      await this.insertWithConfig(parentFoundPayloads)
    }
    return await PayloadBuilder.build([...foundPayloads, ...parentFoundPayloads])
  }

  protected head(): Promisable<Payload | undefined> {
    return this._lastInsertedPayload
  }

  protected insertHandler(_payloads: Payload[]): Promise<WithMeta<Payload>[]> {
    throw new Error('Not implemented')
  }

  protected async insertQueryHandler<T extends QueryBoundWitnessWrapper = QueryBoundWitnessWrapper>(query: T, payloads?: Payload[]) {
    assertEx(payloads, () => `Missing payloads: ${JSON.stringify(query.payload, null, 2)}`)
    const resolvedPayloads = await PayloadBuilder.filterIncludeByDataHash(payloads, query.payloadHashes)
    assertEx(
      resolvedPayloads.length === query.payloadHashes.length,
      () => `Could not find some passed hashes [${resolvedPayloads.length} != ${query.payloadHashes.length}]`,
    )
    const queryPayload = await query.getQuery()
    const payloadsWithoutQuery = await PayloadBuilder.filterExclude(resolvedPayloads, await PayloadBuilder.dataHash(queryPayload))
    const result = await this.insertWithConfig(payloadsWithoutQuery)
    // NOTE: There isn't an exact equivalence between what we get and what we store. Once
    // we move to returning only inserted Payloads(/hash) instead of a BoundWitness, we
    // can grab the actual last one
    this._lastInsertedPayload = resolvedPayloads.at(-1)
    return result
  }

  protected async insertWithConfig(payloads: Payload[], config?: InsertConfig): Promise<WithMeta<Payload>[]> {
    const emitEvents = config?.emitEvents ?? true
    const writeToParents = config?.writeToParents ?? true

    const insertedPayloads = await PayloadBuilder.build(await this.insertHandler(payloads), true)

    if (writeToParents) {
      await this.writeToParents(insertedPayloads)
    }
    if (emitEvents) {
      await this.emit('inserted', { module: this, payloads: insertedPayloads })
    }

    return insertedPayloads
  }

  protected nextHandler(_options?: ArchivistNextOptions): Promisable<WithMeta<Payload>[]> {
    throw new Error('Not implemented')
  }

  protected async nextWithConfig(options?: ArchivistNextOptions, _config?: InsertConfig): Promise<WithMeta<Payload>[]> {
    const foundPayloads = await this.nextHandler(options)
    return await PayloadBuilder.build(foundPayloads)
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
    payloads: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrappedQuery = await QueryBoundWitnessWrapper.parseQuery<ArchivistQueries>(query, payloads)
    const builtQuery = await PayloadBuilder.build(query, true)
    const queryPayload = await wrappedQuery.getQuery()
    assertEx(await this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []

    switch (queryPayload.schema) {
      case ArchivistAllQuerySchema: {
        resultPayloads.push(...(await this.allHandler()))
        break
      }
      case ArchivistClearQuerySchema: {
        await this.clearHandler()
        break
      }
      case ArchivistCommitQuerySchema: {
        resultPayloads.push(...(await this.commitHandler()))
        break
      }
      case ArchivistDeleteQuerySchema: {
        const resultPayload: ArchivistDeleteQuery = {
          hashes: [...(await this.deleteWithConfig(queryPayload.hashes))],
          schema: ArchivistDeleteQuerySchema,
        }
        resultPayloads.push(resultPayload)
        break
      }
      case ArchivistGetQuerySchema: {
        if (queryPayload.hashes?.length) {
          resultPayloads.push(...(await this.getWithConfig(queryPayload.hashes)))
        } else {
          const head = await this.head()
          if (head) resultPayloads.push(head)
        }
        break
      }
      case ArchivistInsertQuerySchema: {
        resultPayloads.push(...(await this.insertQueryHandler(wrappedQuery, payloads)))
        break
      }
      default: {
        const result = await super.queryHandler(query, payloads)
        if (this.config.storeQueries) {
          await this.insertHandler([builtQuery])
        }
        return result
      }
    }
    if (this.config.storeQueries) {
      await this.insertHandler([builtQuery])
    }
    return resultPayloads
  }

  protected async writeToParent(parent: ArchivistInstance, payloads: Payload[]): Promise<PayloadWithMeta[]> {
    return await parent.insert(payloads)
  }

  protected async writeToParents(payloads: Payload[]): Promise<PayloadWithMeta[]> {
    const parents = await this.parents()
    return compact(
      await Promise.all(
        Object.values(parents.write ?? {}).map(async (parent) => {
          return parent ? await this.writeToParent(parent, payloads) : undefined
        }),
      ),
    ).flat()
  }

  private async resolveArchivists(archivists: ModuleIdentifier[] = []) {
    const archivistModules = [
      ...(await this.resolve({ address: archivists as Address[] })),
      ...(await this.resolve({ name: archivists as ModuleName[] })),
    ].filter(duplicateModules)

    assertEx(
      !this.requireAllParents || archivistModules.length === archivists.length,
      () =>
        `Failed to find some archivists (set allRequired to false if ok): [${archivists.filter((archivist) =>
          archivistModules.map((module) => !(module.address === archivist || module.config.name === archivist)),
        )}]`,
    )

    // eslint-disable-next-line unicorn/no-array-reduce
    return archivistModules.reduce<Record<string, ArchivistInstance>>((prev, module) => {
      prev[module.address] = asArchivistInstance(module, () => {
        isArchivistInstance(module, { log: console })
        return `Unable to cast resolved module to an archivist: [${module.address}, ${module.config.name}, ${module.config.schema})}]`
      })

      return prev
    }, {})
  }
}
