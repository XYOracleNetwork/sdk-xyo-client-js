import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { AbstractDirectArchivist } from '@xyo-network/abstract-archivist'
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
  ArchivistInstance,
  ArchivistModuleEventData,
  ArchivistParams,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Logger, PayloadHasher } from '@xyo-network/core'
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
  extends AbstractDirectArchivist<TParams, TEventData>
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

  override async loadAccount(account?: AccountInstance, persistAccount?: boolean, privateStorage?: StoreBase, _logger?: Logger) {
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
  }

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
          const queryPayload = PayloadWrapper.wrap<ArchivistInsertQuery>({
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

  protected override async deleteHandler(hashes: string[]): Promise<boolean[]> {
    this.logger?.log(`delete: hashes.length: ${hashes.length}`)
    const found = hashes.map((hash) => {
      this.storage.remove(hash)
      return true
    })
    await this.emit('deleted', { found, hashes, module: this })
    return found
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    this.logger?.log(`get: hashes.length: ${hashes.length}`)

    return await Promise.all(
      hashes.map(async (hash) => {
        const payload = this.storage.get(hash) ?? (await super.getHandler([hash]))[0] ?? null
        if (this.storeParentReads) {
          this.storage.set(hash, payload)
        }
        return payload
      }),
    )
  }

  protected async insertHandler(payloads: Payload[]): Promise<BoundWitness[]> {
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
    const [[storageBoundWitness]] = await this.bindQueryResult({ payloads, schema: ArchivistInsertQuerySchema }, resultPayloads)
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
