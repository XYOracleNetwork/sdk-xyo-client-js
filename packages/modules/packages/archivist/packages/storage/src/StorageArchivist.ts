import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { Hash } from '@xylabs/hex'
import type { Promisable, PromisableArray } from '@xylabs/promise'
import { fulfilled } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import type {
  ArchivistConfig,
  ArchivistInsertQuery,
  ArchivistInstance,
  ArchivistModuleEventData,
  ArchivistNextOptions,
  ArchivistParams,
  WithStorageMeta,
} from '@xyo-network/archivist-model'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuerySchema,
} from '@xyo-network/archivist-model'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, Schema } from '@xyo-network/payload-model'
import type { StoreBase, StoreType } from 'store2'
import store from 'store2'

const storeTypes = store as unknown as StoreType

export type StorageArchivistConfigSchema = 'network.xyo.archivist.storage.config'
export const StorageArchivistConfigSchema: StorageArchivistConfigSchema = 'network.xyo.archivist.storage.config'

export type StorageArchivistConfig = ArchivistConfig<{
  maxEntries?: number
  maxEntrySize?: number
  namespace?: string
  schema: StorageArchivistConfigSchema
  type?: 'local' | 'session' | 'page'
}>

export type StorageArchivistParams = ArchivistParams<AnyConfigSchema<StorageArchivistConfig>>
export class StorageArchivist<
  TParams extends StorageArchivistParams = StorageArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
>
  extends AbstractArchivist<TParams, TEventData>
  implements ArchivistInstance {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, StorageArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = StorageArchivistConfigSchema

  private _privateStorage: StoreBase | undefined
  private _storage: StoreBase | undefined

  get maxEntries() {
    return this.config?.maxEntries ?? 1000
  }

  get maxEntrySize() {
    return this.config?.maxEntrySize ?? 16_000
  }

  get namespace() {
    return this.config?.namespace ?? 'xyo-archivist'
  }

  override get queries(): string[] {
    return [
      ArchivistAllQuerySchema,
      ArchivistDeleteQuerySchema,
      ArchivistClearQuerySchema,
      ArchivistInsertQuerySchema,
      ArchivistCommitQuerySchema,
      ...super.queries,
    ]
  }

  get type() {
    return this.config?.type ?? 'local'
  }

  /* This has to be a getter so that it can access it during construction */
  private get privateStorage(): StoreBase {
    this._privateStorage = this._storage ?? storeTypes[this.type].namespace(`${this.namespace}|private`)
    return this._privateStorage
  }

  /* This has to be a getter so that it can access it during construction */
  private get storage(): StoreBase {
    this._storage = this._storage ?? storeTypes[this.type].namespace(this.namespace)
    return this._storage
  }

  protected override allHandler(): PromisableArray<Payload> {
    const found = new Set<string>()
    this.logger?.log(`this.storage.length: ${this.storage.length}`)
    return Object.entries(this.storage.getAll())
      .map(([, value]) => value)
      .filter((payload) => {
        if (found.has(payload._dataHash)) {
          return false
        } else {
          found.add(payload._dataHash)
          return true
        }
      })
      .sort((a, b) => a._timestamp - b._timestamp)
      .map(payload => PayloadBuilder.omitStorageMeta(payload))
  }

  protected override clearHandler(): void | Promise<void> {
    this.logger?.log(`this.storage.length: ${this.storage.length}`)
    this.storage.clear()
    return this.emit('cleared', { mod: this })
  }

  protected override async commitHandler(): Promise<BoundWitness[]> {
    this.logger?.log(`this.storage.length: ${this.storage.length}`)
    const payloads = await this.all()
    assertEx(payloads.length > 0, () => 'Nothing to commit')
    const settled = (await Promise.allSettled(
      Object.values((await this.parentArchivists()).commit ?? [])?.map(async (parent) => {
        const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
        const query = await this.bindQuery(queryPayload, payloads)
        return (await parent?.query(query[0], query[1]))?.[0]
      }),
    )).filter(exists)
    // TODO - rather than clear, delete the payloads that come back as successfully inserted
    await this.clear()
    return (settled.filter(fulfilled).map(result => result.value)).filter(exists)
  }

  protected override async deleteHandler(hashes: Hash[]): Promise<Hash[]> {
    return (
      await Promise.all(
        hashes.map((hash) => {
          this.storage.remove(hash)
          return hash
        }),
      )
    ).filter(exists)
  }

  protected getFromOffset(
    order: 'asc' | 'desc' = 'asc',
    limit: number = 10,
    offset?: Hash,
  ): WithStorageMeta[] {
    const found = new Set<string>()
    const payloads: WithStorageMeta[] = Object.entries(this.storage.getAll())
      .map(([, value]) => value)
      .filter((payload) => {
        if (found.has(payload._dataHash)) {
          return false
        } else {
          found.add(payload._dataHash)
          return true
        }
      })
      .sort((a, b) => {
        return order === 'asc' ? a._sequence - b._sequence : b._sequence - a._sequence
      })
    const index = payloads.findIndex(payload => payload._hash === offset)
    if (index !== -1) {
      return payloads.slice(index + 1, index + 1 + limit)
    }
    return payloads.slice(0, limit)
  }

  protected override getHandler(hashes: string[]): Promisable<Payload[]> {
    const found = new Set<string>()
    return (
      hashes.map((hash) => {
        return this.storage.get(hash)
      })
    ).filter(exists)
      .filter((payload) => {
        if (found.has(payload._dataHash)) {
          return false
        } else {
          found.add(payload._dataHash)
          return true
        }
      }).map(payload => PayloadBuilder.omitStorageMeta(payload))
  }

  protected override async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    return await Promise.all(payloads.map(async (payload) => {
      const storagePayload = await StorageArchivist.addSequencedStorageMeta(payload)
      const value = JSON.stringify(storagePayload)
      console.log('insert.storagePayloads:', storagePayload)
      assertEx(value.length < this.maxEntrySize, () => `Payload too large [${storagePayload._hash}, ${value.length}]`)
      this.storage.set(storagePayload._hash, storagePayload)
      this.storage.set(storagePayload._dataHash, storagePayload)
      return payload
    }))
  }

  protected override nextHandler(options?: ArchivistNextOptions): Promisable<Payload[]> {
    const {
      limit, offset, order,
    } = options ?? {}
    return this.getFromOffset(order, limit ?? 10, offset)
  }

  protected override async startHandler() {
    await super.startHandler()
    return true
  }
}
