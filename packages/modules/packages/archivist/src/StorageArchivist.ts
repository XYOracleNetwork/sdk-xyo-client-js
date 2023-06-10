import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/abstract-archivist'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  ArchivistParams,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { PromisableArray } from '@xyo-network/promise'
import compact from 'lodash/compact'
import store, { StoreBase } from 'store2'

export type StorageArchivistConfigSchema = 'network.xyo.module.config.archivist.storage'
export const StorageArchivistConfigSchema: StorageArchivistConfigSchema = 'network.xyo.module.config.archivist.storage'

export type StorageArchivistConfig = ArchivistConfig<{
  maxEntries?: number
  maxEntrySize?: number
  namespace?: string
  persistAccount?: boolean
  schema: StorageArchivistConfigSchema
  type?: 'local' | 'session' | 'page'
}>

export type StorageArchivistParams = ArchivistParams<AnyConfigSchema<StorageArchivistConfig>>
@creatableModule()
export class StorageArchivist<
  TParams extends StorageArchivistParams = StorageArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override configSchema = StorageArchivistConfigSchema

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

  override all(): PromisableArray<Payload> {
    this.logger?.log(`this.storage.length: ${this.storage.length}`)
    return Object.entries(this.storage.getAll()).map(([, value]) => value)
  }

  override clear(): void | Promise<void> {
    this.logger?.log(`this.storage.length: ${this.storage.length}`)
    this.storage.clear()
    return this.emit('cleared', { module: this })
  }

  override async commit(): Promise<BoundWitness[]> {
    this.logger?.log(`this.storage.length: ${this.storage.length}`)
    const payloads = await this.all()
    assertEx(payloads.length > 0, 'Nothing to commit')
    const settled = await Promise.allSettled(
      compact(
        Object.values((await this.parents()).commit ?? [])?.map(async (parent) => {
          const queryPayload = PayloadWrapper.parse<ArchivistInsertQuery>({
            payloads: await PayloadHasher.hashes(payloads),
            schema: ArchivistInsertQuerySchema,
          })
          const query = await this.bindQuery(queryPayload, payloads)
          return (await parent?.query(query[0], query[1]))?.[0]
        }),
      ),
    )
    // TODO - rather than clear, delete the payloads that come back as successfully inserted
    await this.clear()
    return compact(settled.filter(fulfilled).map((result) => result.value))
  }

  override async delete(hashes: string[]): Promise<boolean[]> {
    this.logger?.log(`delete: hashes.length: ${hashes.length}`)
    const found = hashes.map((hash) => {
      this.storage.remove(hash)
      return true
    })
    await this.emit('deleted', { found, hashes, module: this })
    return found
  }

  override async get(hashes: string[]): Promise<Payload[]> {
    this.logger?.log(`get: hashes.length: ${hashes.length}`)

    return await Promise.all(
      hashes.map(async (hash) => {
        const payload = this.storage.get(hash) ?? (await super.get([hash]))[0] ?? null
        if (this.storeParentReads) {
          this.storage.set(hash, payload)
        }
        return payload
      }),
    )
  }

  async insert(payloads: Payload[]): Promise<BoundWitness[]> {
    const resultPayloads = await Promise.all(
      payloads.map(async (payload) => {
        const wrapper = new PayloadWrapper(payload)
        const hash = await wrapper.hashAsync()
        const value = JSON.stringify(wrapper.payload())
        assertEx(value.length < this.maxEntrySize, `Payload too large [${hash}, ${value.length}]`)
        this.storage.set(hash, wrapper.payload())
        return wrapper.payload()
      }),
    )
    const [storageBoundWitness] = await this.bindQueryResult({ payloads, schema: ArchivistInsertQuerySchema }, resultPayloads)
    const parentBoundWitnesses: BoundWitness[] = []
    const parents = await this.parents()
    if (Object.entries(parents.write ?? {}).length) {
      //we store the child bw also
      const [parentBoundWitness] = await this.writeToParents([storageBoundWitness, ...resultPayloads])
      parentBoundWitnesses.push(parentBoundWitness)
    }
    const boundWitnesses = [storageBoundWitness, ...parentBoundWitnesses]
    await this.emit('inserted', { boundWitnesses, module: this })
    return boundWitnesses
  }

  override async start() {
    await super.start()
    this.saveAccount()
  }

  protected override loadAccount(account?: AccountInstance) {
    if (this.persistAccount) {
      const privateKey = this.privateStorage.get('privateKey')
      if (privateKey) {
        try {
          const account = new Account({ privateKey })
          this.logger?.log(account.addressValue.hex)
          return account
        } catch (ex) {
          console.error(`Error reading Account from storage [${this.type}, ${ex}] - Recreating Account`)
          this.privateStorage.remove('privateKey')
        }
      }
    }
    return super.loadAccount(account)
  }

  protected saveAccount() {
    if (this.persistAccount) {
      this.logger?.log(this.account.addressValue.hex)
      this.privateStorage.set('privateKey', this.account.private.hex)
    }
  }
}
