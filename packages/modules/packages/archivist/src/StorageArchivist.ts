import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/abstract-archivist'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistInstance,
  ArchivistModuleEventData,
  ArchivistParams,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { PromisableArray } from '@xyo-network/promise'
import compact from 'lodash/compact'
import store, { StoreBase } from 'store2'

export type StorageArchivistConfigSchema = 'network.xyo.archivist.storage.config'
export const StorageArchivistConfigSchema: StorageArchivistConfigSchema = 'network.xyo.archivist.storage.config'

export type StorageArchivistConfig = ArchivistConfig<{
  maxEntries?: number
  maxEntrySize?: number
  namespace?: string
  persistAccount?: boolean
  schema: StorageArchivistConfigSchema
  type?: 'local' | 'session' | 'page'
}>

export type StorageArchivistParams = ArchivistParams<AnyConfigSchema<StorageArchivistConfig>>
export class StorageArchivist<
    TParams extends StorageArchivistParams = StorageArchivistParams,
    TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  >
  extends AbstractArchivist<TParams, TEventData>
  implements ArchivistInstance
{
  static override configSchemas = [StorageArchivistConfigSchema]

  private _privateStorage: StoreBase | undefined
  private _storage: StoreBase | undefined

  get maxEntries() {
    return this.config?.maxEntries ?? 1000
  }

  get maxEntrySize() {
    return this.config?.maxEntrySize ?? 16000
  }

  get namespace() {
    return this.config?.namespace ?? 'xyo-archivist'
  }

  get persistAccount() {
    return this.config?.persistAccount ?? false
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
    this._privateStorage = this._storage ?? store[this.type].namespace(`${this.namespace}|private`)
    return this._privateStorage
  }

  /* This has to be a getter so that it can access it during construction */
  private get storage(): StoreBase {
    this._storage = this._storage ?? store[this.type].namespace(this.namespace)
    return this._storage
  }

  /*override async loadAccount(account?: AccountInstance, persistAccount?: boolean, privateStorage?: StoreBase, _logger?: Logger) {
    if (!this._account) {
      if (persistAccount) {
        const privateKey = privateStorage?.get('privateKey')
        if (privateKey) {
          try {
            this._account = await Account.create({ privateKey })
            return this._account
          } catch (ex) {
            console.error(`Error reading Account from storage [${ex}] - Recreating Account`)
            privateStorage?.remove('privateKey')
          }
        }
      }
    }
    return await super.loadAccount()
  }*/

  protected override allHandler(): PromisableArray<Payload> {
    this.logger?.log(`this.storage.length: ${this.storage.length}`)
    return Object.entries(this.storage.getAll()).map(([, value]) => value)
  }

  protected override clearHandler(): void | Promise<void> {
    this.logger?.log(`this.storage.length: ${this.storage.length}`)
    this.storage.clear()
    return this.emit('cleared', { module: this })
  }

  protected override async commitHandler(): Promise<BoundWitness[]> {
    this.logger?.log(`this.storage.length: ${this.storage.length}`)
    const payloads = await this.all()
    assertEx(payloads.length > 0, 'Nothing to commit')
    const settled = await Promise.allSettled(
      compact(
        Object.values((await this.parents()).commit ?? [])?.map(async (parent) => {
          const queryPayload: ArchivistInsertQuery = {
            schema: ArchivistInsertQuerySchema,
          }
          const query = await this.bindQuery(queryPayload, payloads)
          return (await parent?.query(query[0], query[1]))?.[0]
        }),
      ),
    )
    // TODO - rather than clear, delete the payloads that come back as successfully inserted
    await this.clear()
    return compact(settled.filter(fulfilled).map((result) => result.value))
  }

  protected override async deleteHandler(hashes: string[]): Promise<Payload[]> {
    const payloadPairs: [string, Payload][] = await Promise.all(
      (await this.get(hashes)).map<Promise<[string, Payload]>>(async (payload) => [await PayloadHasher.hashAsync(payload), payload]),
    )
    const deletedPairs: [string, Payload][] = compact(
      await Promise.all(
        payloadPairs.map<[string, Payload] | undefined>(([hash, payload]) => {
          this.storage.remove(hash)
          return [hash, payload]
        }),
      ),
    )
    await this.emit('deleted', { hashes: deletedPairs.map(([hash, _]) => hash), module: this })
    const result = deletedPairs.map(([_, payload]) => payload)
    return result
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    const { found, notfound } = hashes.reduce<{ found: Payload[]; notfound: string[] }>(
      (prev, hash) => {
        const found = this.storage.get(hash)
        if (found) {
          prev.found.push(found)
        } else {
          prev.notfound.push(hash)
        }
        return prev
      },
      { found: [], notfound: [] },
    )

    const parentFound = notfound.length > 0 ? await super.getHandler(notfound) : []

    if (this.storeParentReads) {
      await Promise.all(
        parentFound.map(async (payload) => {
          const hash = await PayloadHasher.hashAsync(payload)
          this.storage.set(hash, payload)
        }),
      )
    }
    return [...found, ...parentFound]
  }

  protected async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    const resultPayloads = await Promise.all(
      payloads.map(async (payload) => {
        const wrapper = PayloadWrapper.wrap(payload)
        const hash = await wrapper.hashAsync()
        const value = JSON.stringify(wrapper.payload())
        assertEx(value.length < this.maxEntrySize, `Payload too large [${hash}, ${value.length}]`)
        this.storage.set(hash, wrapper.payload())
        return wrapper.payload()
      }),
    )
    await this.writeToParents(resultPayloads)
    await this.emit('inserted', { module: this, payloads })
    return payloads
  }

  protected saveAccount() {
    if (this.persistAccount) {
      const account = this.account
      this.logger?.log(account.address)
      this.privateStorage.set('privateKey', account.private.hex)
    }
  }

  protected override async startHandler() {
    await super.startHandler()
    this.saveAccount()
    return true
  }
}
