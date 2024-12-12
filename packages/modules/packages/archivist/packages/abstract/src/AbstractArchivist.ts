import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { type Address, type Hash } from '@xylabs/hex'
import { globallyUnique } from '@xylabs/object'
import type { Promisable, PromisableArray } from '@xylabs/promise'
import { difference } from '@xylabs/set'
import type { AccountInstance } from '@xyo-network/account-model'
import type {
  ArchivistAllQuery,
  ArchivistClearQuery,
  ArchivistCommitQuery,
  ArchivistDeleteQuery,
  ArchivistGetQuery,
  ArchivistInsertQuery,
  ArchivistInstance,
  ArchivistModuleEventData,
  ArchivistNextOptions,
  ArchivistNextQuery,
  ArchivistParams,
  ArchivistQueries,
  AttachableArchivistInstance,
} from '@xyo-network/archivist-model'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfigSchema,
  ArchivistDeleteQuerySchema,
  ArchivistGetQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistNextQuerySchema,
  asArchivistInstance,
  isArchivistInstance,
} from '@xyo-network/archivist-model'
import type { BoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import type {
  ModuleConfig, ModuleIdentifier, ModuleName, ModuleQueryHandlerResult, ModuleQueryResult,
} from '@xyo-network/module-model'
import { duplicateModules } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'

const NOT_IMPLEMENTED = 'Not implemented' as const

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
  implements AttachableArchivistInstance<TParams, TEventData, Payload> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, ArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = ArchivistConfigSchema
  static override readonly uniqueName = globallyUnique('AbstractArchivist', AbstractArchivist, 'xyo')
  private _parentArchivists?: ArchivistParentInstances

  override get queries(): string[] {
    return [ArchivistGetQuerySchema, ...super.queries]
  }

  get requireAllParents() {
    return this.config.requireAllParents ?? false
  }

  protected get storeParentReads() {
    return !!this.config?.storeParentReads
  }

  all(): PromisableArray<WithStorageMeta<Payload>> {
    this._noOverride('all')
    return this.busy(async () => {
      await this.started('throw')
      return PayloadBuilder.omitPrivateStorageMeta(await this.allHandler())
    })
  }

  async allQuery(account: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistAllQuery = { schema: ArchivistAllQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  clear(): Promisable<void> {
    this._noOverride('clear')
    return this.busy(async () => {
      await this.started('throw')
      return await this.clearHandler()
    })
  }

  async clearQuery(account: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistClearQuery = { schema: ArchivistClearQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  commit(): Promisable<BoundWitness[]> {
    this._noOverride('commit')
    return this.busy(async () => {
      await this.started('throw')
      return await this.commitHandler()
    })
  }

  async commitQuery(account: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistCommitQuery = { schema: ArchivistCommitQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async delete(hashes: Hash[]): Promise<Hash[]> {
    this._noOverride('delete')
    return await this.busy(async () => {
      await this.started('throw')
      return await this.deleteWithConfig(hashes)
    })
  }

  async deleteQuery(hashes: Hash[], account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistDeleteQuery = { hashes, schema: ArchivistDeleteQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async get(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    this._noOverride('get')
    return await this.busy(async () => {
      await this.started('throw')
      return await this.getWithConfig(hashes)
    })
  }

  async getQuery(hashes: Hash[], account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistGetQuery = { hashes, schema: ArchivistGetQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async insert(payloads: Payload[]): Promise<WithStorageMeta<Payload>[]> {
    this._noOverride('insert')
    return await this.busy(async () => {
      await this.started('throw')
      return await this.insertWithConfig(PayloadBuilder.omitStorageMeta(payloads))
    })
  }

  async insertQuery(payloads: Payload[], account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }

  async next(options?: ArchivistNextOptions): Promise<WithStorageMeta<Payload>[]> {
    this._noOverride('next')
    return await this.busy(async () => {
      await this.started('throw')
      return await this.nextWithConfig(options)
    })
  }

  async nextQuery(options?: ArchivistNextOptions, account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ArchivistNextQuery = { schema: ArchivistNextQuerySchema, ...options }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  protected allHandler(): PromisableArray<WithStorageMeta<Payload>> {
    throw new Error(NOT_IMPLEMENTED)
  }

  protected clearHandler(): Promisable<void> {
    throw new Error(NOT_IMPLEMENTED)
  }

  protected commitHandler(): Promisable<BoundWitness[]> {
    throw new Error(NOT_IMPLEMENTED)
  }

  protected deleteHandler(_hashes: Hash[]): PromisableArray<Hash> {
    throw new Error(NOT_IMPLEMENTED)
  }

  protected async deleteWithConfig(hashes: Hash[], config?: ActionConfig): Promise<Hash[]> {
    const emitEvents = config?.emitEvents ?? true

    const deletedHashes = await this.deleteHandler(hashes)

    if (emitEvents) {
      await this.emit('deleted', { hashes: deletedHashes, mod: this })
    }

    return deletedHashes
  }

  protected async getFromParent(hashes: Hash[], archivist: ArchivistInstance): Promise<[WithStorageMeta<Payload>[], Hash[]]> {
    const foundPairs = (await PayloadBuilder.dataHashPairs(await archivist.get(hashes))).filter(([, hash]) => {
      const askedFor = hashes.includes(hash)
      if (!askedFor) {
        console.warn(`Parent returned payload with hash not asked for: ${hash}`)
        // throw Error(`Parent returned payload with hash not asked for: ${hash}`)
      }
      return askedFor
    })

    const foundHashes = new Set(foundPairs.map(([, hash]) => hash))
    const foundPayloads = foundPairs.map(([payload]) => payload)

    const notfound = hashes.filter(hash => !foundHashes.has(hash))
    return [foundPayloads, notfound]
  }

  protected async getFromParents(hashes: Hash[]): Promise<[WithStorageMeta<Payload>[], Hash[]]> {
    const parents = Object.values((await this.parentArchivists())?.read ?? {})
    let remainingHashes = [...hashes]
    let parentIndex = 0
    let result: WithStorageMeta<Payload>[] = []

    // NOTE: intentionally doing this serially
    while (parentIndex < parents.length && remainingHashes.length > 0) {
      const [found, notfound] = await this.getFromParent(remainingHashes, parents[parentIndex])
      result = [...result, ...found]
      remainingHashes = notfound
      parentIndex++
    }
    return [result, remainingHashes]
  }

  protected getHandler(_hashes: Hash[]): Promisable<WithStorageMeta<Payload>[]> {
    throw new Error(NOT_IMPLEMENTED)
  }

  protected async getWithConfig(hashes: Hash[], _config?: InsertConfig): Promise<WithStorageMeta<Payload>[]> {
    // Filter out duplicates
    const requestedHashes = new Set(hashes)

    // Attempt to find the payloads in the store
    const gotten = await this.getHandler([...requestedHashes])

    // Do not just blindly return what the archivist told us but
    // ensure to only return requested payloads and keep track of
    // the ones it did not find so we can ask the parents.
    const foundPayloads: WithStorageMeta<Payload>[] = []
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
          requestedHashes.has(hash) // Indicate that we found it (but do not insert it yet). Since
          // one payload could satisfy two requested hashes (vit its dataHash
          // & rootHash) we only want to insert that payload once but we want
          // to keep track of all the hashes it satisfies so we can ask th
          // parents for the ones we did not find
          && !foundHashes.has(hash)
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
    return PayloadBuilder.omitPrivateStorageMeta([...foundPayloads, ...parentFoundPayloads])
  }

  protected insertHandler(_payloads: Payload[]): Promise<WithStorageMeta<Payload>[]> {
    throw new Error(NOT_IMPLEMENTED)
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
    return result
  }

  protected async insertWithConfig(payloads: Payload[], config?: InsertConfig): Promise<WithStorageMeta<Payload>[]> {
    const emitEvents = config?.emitEvents ?? true
    const writeToParents = config?.writeToParents ?? true

    const insertedPayloads = await this.insertHandler(PayloadBuilder.omitStorageMeta(payloads))

    if (writeToParents) {
      await this.writeToParents(insertedPayloads)
    }
    if (emitEvents) {
      await this.emit('inserted', { mod: this, payloads: insertedPayloads })
    }

    return PayloadBuilder.omitPrivateStorageMeta(insertedPayloads)
  }

  protected nextHandler(_options?: ArchivistNextOptions): Promisable<WithStorageMeta<Payload>[]> {
    throw new Error(NOT_IMPLEMENTED)
  }

  protected async nextWithConfig(options?: ArchivistNextOptions, _config?: InsertConfig): Promise<WithStorageMeta<Payload>[]> {
    const foundPayloads = await this.nextHandler(options)
    return PayloadBuilder.omitPrivateStorageMeta(foundPayloads)
  }

  protected async parentArchivists() {
    this._parentArchivists = this._parentArchivists ?? {
      commit: await this.resolveArchivists(this.config?.parents?.commit),
      read: await this.resolveArchivists(this.config?.parents?.read),
      write: await this.resolveArchivists(this.config?.parents?.write),
    }
    return assertEx(this._parentArchivists)
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const sanitizedQuery = PayloadBuilder.omitStorageMeta(query)
    const sanitizedPayloads = PayloadBuilder.omitStorageMeta(payloads)
    const wrappedQuery = QueryBoundWitnessWrapper.parseQuery<ArchivistQueries>(sanitizedQuery, sanitizedPayloads)
    const queryPayload = await wrappedQuery.getQuery()
    assertEx(await this.queryable(sanitizedQuery, sanitizedPayloads, queryConfig))
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
        resultPayloads.push(await PayloadBuilder.addSequencedStorageMeta(resultPayload))
        break
      }
      case ArchivistGetQuerySchema: {
        resultPayloads.push(...(await this.getWithConfig(queryPayload.hashes ?? [])))
        break
      }
      case ArchivistInsertQuerySchema: {
        resultPayloads.push(...(await this.insertQueryHandler(wrappedQuery, sanitizedPayloads)))
        break
      }
      case ArchivistNextQuerySchema: {
        resultPayloads.push(...(await this.nextHandler(queryPayload)))
        break
      }
      default: {
        const result = await super.queryHandler(sanitizedQuery, sanitizedPayloads)
        if (this.config.storeQueries) {
          await this.insertHandler([sanitizedQuery])
        }
        return PayloadBuilder.omitPrivateStorageMeta(result)
      }
    }
    if (this.config.storeQueries) {
      await this.insertHandler([sanitizedQuery])
    }
    return PayloadBuilder.omitPrivateStorageMeta(resultPayloads)
  }

  protected async writeToParent(parent: ArchivistInstance, payloads: Payload[]): Promise<Payload[]> {
    return await parent.insert(PayloadBuilder.omitStorageMeta(payloads))
  }

  protected async writeToParents(payloads: Payload[]): Promise<Payload[]> {
    const parents = await this.parentArchivists()
    return (
      await Promise.all(
        Object.values(parents.write ?? {}).map(async (parent) => {
          return parent ? await this.writeToParent(parent, payloads) : undefined
        }),
      )
    ).filter(exists).flat()
  }

  private async resolveArchivists(archivists: ModuleIdentifier[] = []) {
    const archivistModules = [
      ...(await this.resolve({ address: archivists as Address[] })),
      ...(await this.resolve({ name: archivists as ModuleName[] })),
    ].filter(duplicateModules)

    assertEx(
      !this.requireAllParents || archivistModules.length === archivists.length,
      () =>
        `Failed to find some archivists (set allRequired to false if ok): [${archivists.filter(archivist =>
          archivistModules.map(mod => !(mod.address === archivist || mod.modName === archivist)))}]`,
    )

    // eslint-disable-next-line unicorn/no-array-reduce
    return archivistModules.reduce<Record<string, ArchivistInstance>>((prev, mod) => {
      prev[mod.address] = asArchivistInstance(mod, () => {
        isArchivistInstance(mod, { log: console })
        return `Unable to cast resolved module to an archivist: [${mod.address}, ${mod.modName}, ${mod.config.schema})}]`
      })

      return prev
    }, {})
  }
}
