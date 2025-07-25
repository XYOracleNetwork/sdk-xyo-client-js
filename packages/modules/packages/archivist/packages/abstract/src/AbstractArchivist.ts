/* eslint-disable max-lines */
import type { Gauge, Meter } from '@opentelemetry/api'
import { assertEx } from '@xylabs/assert'
import { globallyUnique } from '@xylabs/base'
import { exists } from '@xylabs/exists'
import type { Address, Hash } from '@xylabs/hex'
import type { Promisable, PromisableArray } from '@xylabs/promise'
import { difference } from '@xylabs/set'
import { spanAsync } from '@xylabs/telemetry'
import { isNull, isUndefined } from '@xylabs/typeof'
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
  ArchivistSnapshotPayload,
  ArchivistSnapshotQuery,
  ArchivistStatsPayload,
  AttachableArchivistInstance,
  ReadArchivist,
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
  ArchivistSnapshotQuerySchema,
  ArchivistStatsPayloadSchema,
  asArchivistInstance,
  isArchivistInstance,
} from '@xyo-network/archivist-model'
import type { BoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import type {
  ModuleConfig, ModuleIdentifier, ModuleQueryHandlerResult, ModuleQueryResult,
} from '@xyo-network/module-model'
import { creatableModule, duplicateModules } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

import { StorageClassLabel } from './StorageClassLabel.ts'

const NOT_IMPLEMENTED = 'Not implemented' as const

export interface ActionConfig {
  emitEvents?: boolean
}

export interface InsertConfig extends ActionConfig {
  writeToParents?: boolean
}

interface ArchivistParentInstanceMap {
  commit?: Partial<Record<ModuleIdentifier, ArchivistInstance>>
  read?: Partial<Record<ModuleIdentifier, ArchivistInstance>>
  write?: Partial<Record<ModuleIdentifier, ArchivistInstance>>
}

creatableModule()
export abstract class AbstractArchivist<
  TParams extends ArchivistParams = ArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
>
  extends AbstractModuleInstance<TParams, TEventData>
  implements AttachableArchivistInstance<TParams, TEventData, Payload> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, ArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = ArchivistConfigSchema
  static override readonly labels = { ...super.labels, [StorageClassLabel]: 'unknown' }
  static override readonly uniqueName = globallyUnique('AbstractArchivist', AbstractArchivist, 'xyo')

  // override this if a specialized archivist should have a different default next limit
  protected static defaultNextLimitSetting = 100

  private _getCache?: LRUCache<Hash, WithStorageMeta<Payload>>
  private _parentArchivists?: ArchivistParentInstanceMap
  private _payloadCountGauge?: Gauge | null
  private _payloadCountMeter?: Meter | null

  // do not override this!  It is meant to get the this.defaultNextLimitSetting and work if it is overridden
  static get defaultNextLimit() {
    return this.defaultNextLimitSetting
  }

  override get queries(): string[] {
    return [ArchivistGetQuerySchema, ...super.queries]
  }

  get requireAllParents() {
    return this.config.requireAllParents ?? false
  }

  protected get payloadCountGauge() {
    const meter = this.payloadCountMeter
    if (!isNull(meter)) {
      this._payloadCountGauge = meter?.createGauge('payloadCount', { description: 'Payloads in the archivist' })
    }
    return this._payloadCountGauge
  }

  protected get payloadCountMeter(): Meter | null {
    if (isUndefined(this._payloadCountMeter)) {
      this._payloadCountMeter = this.params?.meterProvider?.getMeter(this.id) ?? null
    }
    return this._payloadCountMeter ?? null
  }

  protected get storeParentReads() {
    return !!this.config?.storeParentReads
  }

  /** deprecated use next or snapshot instead */
  async all(): Promise<WithStorageMeta<Payload>[]> {
    this._noOverride('all')
    this.isSupportedQuery(ArchivistAllQuerySchema, 'all')
    return await spanAsync('all', async () => {
      if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
        return []
      }
      try {
        await this.globalReentrancyMutex?.acquire()
        return await this.busy(async () => {
          await this.started('throw')
          return PayloadBuilder.omitPrivateStorageMeta(await this.allHandler()) as WithStorageMeta<Payload>[]
        })
      } finally {
        this.globalReentrancyMutex?.release()
      }
    }, this.tracer)
  }

  /** deprecated use nextQuery or snapshotQuery instead */
  async allQuery(account: AccountInstance): Promise<ModuleQueryResult> {
    this._noOverride('allQuery')
    const queryPayload: ArchivistAllQuery = { schema: ArchivistAllQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async clear(): Promise<void> {
    this._noOverride('clear')
    this.isSupportedQuery(ArchivistClearQuerySchema, 'clear')
    return await spanAsync('clear', async () => {
      if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
        return
      }
      try {
        await this.globalReentrancyMutex?.acquire()
        return await this.busy(async () => {
          await this.started('throw')
          await this.clearHandler()
          this.reportPayloadCount()
          await this.emit('cleared', { mod: this })
        })
      } finally {
        this.globalReentrancyMutex?.release()
      }
    }, this.tracer)
  }

  async clearQuery(account: AccountInstance): Promise<ModuleQueryResult> {
    this._noOverride('clearQuery')
    const queryPayload: ArchivistClearQuery = { schema: ArchivistClearQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async commit(): Promise<BoundWitness[]> {
    this._noOverride('commit')
    this.isSupportedQuery(ArchivistCommitQuerySchema, 'commit')
    return await spanAsync('commit', async () => {
      if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
        return []
      }
      try {
        await this.globalReentrancyMutex?.acquire()
        return await this.busy(async () => {
          await this.started('throw')
          return await this.commitHandler()
        })
      } finally {
        this.globalReentrancyMutex?.release()
      }
    }, this.tracer)
  }

  async commitQuery(account: AccountInstance): Promise<ModuleQueryResult> {
    this._noOverride('commitQuery')
    const queryPayload: ArchivistCommitQuery = { schema: ArchivistCommitQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async delete(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    this._noOverride('delete')
    this.isSupportedQuery(ArchivistDeleteQuerySchema, 'delete')
    return await spanAsync('delete', async () => {
      if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
        return []
      }
      try {
        await this.globalReentrancyMutex?.acquire()
        return await this.busy(async () => {
          await this.started('throw')
          return await this.deleteWithConfig(hashes)
        })
      } finally {
        this.globalReentrancyMutex?.release()
      }
    }, this.tracer)
  }

  async deleteQuery(hashes: Hash[], account?: AccountInstance): Promise<ModuleQueryResult> {
    this._noOverride('deleteQuery')
    const queryPayload: ArchivistDeleteQuery = { hashes, schema: ArchivistDeleteQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async get(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    this._noOverride('get')
    this.isSupportedQuery(ArchivistGetQuerySchema, 'get')
    return await spanAsync('get', async () => {
      if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
        return []
      }
      try {
        await this.globalReentrancyMutex?.acquire()
        return await this.busy(async () => {
          await this.started('throw')
          return await this.getWithConfig(hashes)
        })
      } finally {
        this.globalReentrancyMutex?.release()
      }
    }, this.tracer)
  }

  async getQuery(hashes: Hash[], account?: AccountInstance): Promise<ModuleQueryResult> {
    this._noOverride('getQuery')
    const queryPayload: ArchivistGetQuery = { hashes, schema: ArchivistGetQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async insert(payloads: Payload[]): Promise<WithStorageMeta<Payload>[]> {
    this._noOverride('insert')
    this.isSupportedQuery(ArchivistInsertQuerySchema, 'insert')
    return await spanAsync('insert', async () => {
      if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
        return []
      }
      try {
        await this.globalReentrancyMutex?.acquire()
        return await this.busy(async () => {
          await this.started('throw')
          return await this.insertWithConfig(PayloadBuilder.omitStorageMeta(payloads) as WithStorageMeta<Payload>[])
        })
      } finally {
        this.globalReentrancyMutex?.release()
      }
    }, this.tracer)
  }

  async insertQuery(payloads: Payload[], account?: AccountInstance): Promise<ModuleQueryResult> {
    this._noOverride('insertQuery')
    const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }

  async next(options?: ArchivistNextOptions): Promise<WithStorageMeta<Payload>[]> {
    this._noOverride('next')
    this.isSupportedQuery(ArchivistNextQuerySchema, 'next')
    return await spanAsync('next', async () => {
      if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
        return []
      }
      try {
        await this.globalReentrancyMutex?.acquire()
        return await this.busy(async () => {
          await this.started('throw')
          const { limit = AbstractArchivist.defaultNextLimit, ...otherOptions } = options ?? {}
          return await this.nextWithConfig({ limit, ...otherOptions })
        })
      } finally {
        this.globalReentrancyMutex?.release()
      }
    }, this.tracer)
  }

  async nextQuery(options?: ArchivistNextOptions, account?: AccountInstance): Promise<ModuleQueryResult> {
    this._noOverride('nextQuery')
    const queryPayload: ArchivistNextQuery = { schema: ArchivistNextQuerySchema, ...options }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async snapshot(): Promise<ArchivistSnapshotPayload<WithStorageMeta<Payload>, Hash>[]> {
    this._noOverride('snapshot')
    this.isSupportedQuery(ArchivistSnapshotQuerySchema, 'snapshot')
    return await spanAsync('snapshot', async () => {
      if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
        throw new Error('Cannot take snapshot while in a global reentrancy lock')
      }
      try {
        await this.globalReentrancyMutex?.acquire()
        return await this.busy(async () => {
          await this.started('throw')
          return await this.snapshotHandler()
        })
      } finally {
        this.globalReentrancyMutex?.release()
      }
    }, this.tracer)
  }

  async snapshotQuery(account?: AccountInstance): Promise<ModuleQueryResult> {
    this._noOverride('snapshotQuery')
    const queryPayload: ArchivistSnapshotQuery = { schema: ArchivistSnapshotQuerySchema }
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

  protected deleteHandler(_hashes: Hash[]): PromisableArray<WithStorageMeta<Payload>> {
    throw new Error(NOT_IMPLEMENTED)
  }

  protected async deleteWithConfig(hashes: Hash[], config?: ActionConfig): Promise<WithStorageMeta<Payload>[]> {
    const emitEvents = config?.emitEvents ?? true

    const payloads = await this.deleteHandler(hashes)
    const hashesDeleted = payloads.map(p => p._hash)

    if (emitEvents) {
      await this.emit('deleted', {
        hashes: hashesDeleted, payloads, mod: this,
      })
    }
    this.reportPayloadCount()
    return payloads
  }

  protected generateStats(): Promisable<ArchivistStatsPayload> {
    return {
      payloadCount: this.payloadCountHandler(),
      schema: ArchivistStatsPayloadSchema,
    }
  }

  protected async getFromParent(hashes: Hash[], archivist: ReadArchivist): Promise<[WithStorageMeta<Payload>[], Hash[]]> {
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
      const parent = parents[parentIndex]
      if (parent) {
        const [found, notfound] = await this.getFromParent(remainingHashes, parent)
        result = [...result, ...found]
        remainingHashes = notfound
      }
      parentIndex++
    }
    return [result, remainingHashes]
  }

  protected getHandler(_hashes: Hash[]): Promisable<WithStorageMeta<Payload>[]> {
    throw new Error(NOT_IMPLEMENTED)
  }

  // eslint-disable-next-line max-statements
  protected async getWithConfig(hashes: Hash[], _config?: InsertConfig): Promise<WithStorageMeta<Payload>[]> {
    // Filter out duplicates
    const requestedHashes = new Set(hashes)

    // read from cache if we are caching
    const cache = this._getCache
    let fromCache: WithStorageMeta<Payload>[] = []
    let remainingHashes = [...requestedHashes]
    if (cache !== undefined) {
      fromCache = hashes.map(hash => cache.get(hash)).filter(exists)
      remainingHashes = hashes.filter(hash => !fromCache.some(payload => payload?._hash === hash || payload?._dataHash === hash))
    }

    // Attempt to find the payloads in the store
    const fromGet = await this.getHandler([...remainingHashes])
    const gotten = [...fromCache, ...fromGet].toSorted(PayloadBuilder.compareStorageMeta)

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
    const result = this.omitClientMetaForDataHashes(
      hashes,
      (PayloadBuilder.omitPrivateStorageMeta([
        ...foundPayloads,
        ...parentFoundPayloads,
      ]) as WithStorageMeta<Payload>[]).toSorted(PayloadBuilder.compareStorageMeta),
    )

    // write to cache if we are caching
    if (cache !== undefined) {
      for (const payload of gotten) {
        cache.set(payload._hash, payload)
        cache.set(payload._dataHash, payload)
      }
      for (const payload of parentFoundPayloads) {
        cache.set(payload._hash, payload)
        cache.set(payload._dataHash, payload)
      }
    }

    return result
  }

  protected insertHandler(_payloads: WithStorageMeta<Payload>[]): Promisable<WithStorageMeta<Payload>[]> {
    throw new Error(NOT_IMPLEMENTED)
  }

  protected async insertQueryHandler<T extends QueryBoundWitnessWrapper = QueryBoundWitnessWrapper>(query: T, payloads?: Payload[]) {
    assertEx(payloads, () => `Missing payloads: ${JSON.stringify(query.payload, null, 2)}`)
    const resolvedPayloads = await PayloadBuilder.filterIncludeByEitherHash(payloads, query.payloadHashes)
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

    // remove the existing payloads
    const withStorageMeta = await PayloadBuilder.addStorageMeta(payloads)
    const hashes = withStorageMeta.map(p => p._hash)
    const existingPayloads = await this.getWithConfig(hashes)
    const existingHashes = new Set(existingPayloads.map(p => p._hash))
    const payloadsToInsert = withStorageMeta.filter(p => !existingHashes.has(p._hash))

    const insertedPayloads = await this.insertHandler(payloadsToInsert)

    if (writeToParents) {
      await this.writeToParents(insertedPayloads)
    }
    if (emitEvents) {
      await this.emit('inserted', {
        mod: this, payloads: insertedPayloads, outPayloads: insertedPayloads, inPayloads: payloads,
      })
    }
    this.reportPayloadCount()
    return PayloadBuilder.omitPrivateStorageMeta(insertedPayloads) as WithStorageMeta<Payload>[]
  }

  protected nextHandler(_options?: ArchivistNextOptions): Promisable<WithStorageMeta<Payload>[]> {
    throw new Error(NOT_IMPLEMENTED)
  }

  protected async nextWithConfig(options?: ArchivistNextOptions, _config?: InsertConfig): Promise<WithStorageMeta<Payload>[]> {
    const foundPayloads = await this.nextHandler(options)
    return PayloadBuilder.omitPrivateStorageMeta(foundPayloads) as WithStorageMeta<Payload>[]
  }

  protected async parentArchivists() {
    this._parentArchivists = this._parentArchivists ?? {
      commit: { ...await this.resolveArchivists(this.config?.parents?.commit, this.params.parents?.commit) },
      read: { ...await this.resolveArchivists(this.config?.parents?.read) },
      write: { ...await this.resolveArchivists(this.config?.parents?.write) },
    }
    return assertEx(this._parentArchivists)
  }

  // the number of payloads in the archivist, -1 if not implemented
  // the implementations of these must be fast, so they may not be promises and should read an auto updated value
  protected payloadCountHandler() {
    return -1
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const sanitizedQuery = PayloadBuilder.omitStorageMeta(query) as T
    const sanitizedPayloads = PayloadBuilder.omitStorageMeta(payloads) as Payload[]
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
        resultPayloads.push(...(await this.deleteWithConfig(queryPayload.hashes)))
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
      case ArchivistSnapshotQuerySchema: {
        resultPayloads.push(...(await this.snapshotHandler()))
        break
      }
      default: {
        const result = await super.queryHandler(sanitizedQuery, sanitizedPayloads)
        if (this.config.storeQueries) {
          await this.insertWithConfig([sanitizedQuery])
        }
        return PayloadBuilder.omitPrivateStorageMeta(result) as ModuleQueryHandlerResult
      }
    }
    if (this.config.storeQueries) {
      await this.insertWithConfig([sanitizedQuery])
    }
    return PayloadBuilder.omitPrivateStorageMeta(resultPayloads) as ModuleQueryHandlerResult
  }

  protected reportPayloadCount() {
    this._noOverride('reportPayloadCount')
    const gauge = this.payloadCountGauge
    if (gauge) {
      gauge.record(this.payloadCountHandler())
    }
  }

  protected snapshotHandler(): PromisableArray<ArchivistSnapshotPayload<WithStorageMeta<Payload>, Hash>> {
    throw new Error(NOT_IMPLEMENTED)
  }

  protected override async startHandler() {
    if (this.config.getCache?.enabled === true) {
      this._getCache = new LRUCache({
        max: this.config.getCache?.maxEntries ?? 10_000,
        allowStale: true,
        noDisposeOnSet: false,
        updateAgeOnGet: true,
      })
    }
    const result = await super.startHandler()
    this.reportPayloadCount()
    return result
  }

  protected override async stateHandler(): Promise<Payload[]> {
    return [...await super.stateHandler(), await this.generateStats()]
  }

  protected async writeToParent(parent: ArchivistInstance, payloads: Payload[]): Promise<Payload[]> {
    return await parent.insert(PayloadBuilder.omitStorageMeta(payloads) as Payload[])
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

  private omitClientMetaForDataHashes<T extends Payload>(hashes: Hash[], payloads: WithStorageMeta<T>[]): WithStorageMeta<T>[] {
    return payloads.map((payload) => {
      // if retrieved by dataHash and not hash (both could have been specified)
      if (hashes.includes(payload._dataHash) && !hashes.includes(payload._hash)) {
        // scrub client meta
        const result = PayloadBuilder.omitClientMeta(payload) as WithStorageMeta<T>
        // we also scrub the _hash
        result._hash = result._dataHash
        return result
      } else {
        return payload
      }
    })
  }

  private async resolveArchivists(archivists: ModuleIdentifier[] = [], archivistInstances?: ArchivistInstance[]) {
    const archivistModules = (await Promise.all(archivists.map(archivist => this.resolve(archivist)))).filter(exists).filter(duplicateModules)

    assertEx(
      !this.requireAllParents || (archivistModules.length === archivists.length),
      () =>
        `Failed to find some archivists for ${this.modName} (set allRequired to false if ok)]`,
    )

    const archivistInstancesMap: Record<Address, ArchivistInstance> = {}
    for (let archivistInstance of archivistInstances ?? []) {
      archivistInstancesMap[archivistInstance.address] = archivistInstance
    }

    // eslint-disable-next-line unicorn/no-array-reduce
    return archivistModules.reduce<Record<Address, ArchivistInstance>>((prev, mod) => {
      prev[mod.address] = asArchivistInstance(mod, () => {
        isArchivistInstance(mod, { log: console })
        return `Unable to cast resolved module to an archivist: [${mod.address}, ${mod.modName}, ${mod.config.schema})}]`
      }, { required: true })

      return prev
    }, archivistInstancesMap)
  }
}
