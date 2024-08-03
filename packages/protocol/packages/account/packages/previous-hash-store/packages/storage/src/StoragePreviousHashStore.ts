import { Address, Hash } from '@xylabs/hex'
import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import store, { StoreBase } from 'store2'

export type Storage = 'local' | 'session' | 'page'

export type StoragePreviousHashOpts = {
  namespace?: string
  type?: Storage
}

export class StoragePreviousHashStore implements PreviousHashStore {
  static readonly DefaultNamespace = 'xyo-previous-hash-store'
  static readonly DefaultStorageType: Storage = 'local'
  private _namespace = StoragePreviousHashStore.DefaultNamespace
  private _storage: StoreBase | undefined
  private _type: Storage = StoragePreviousHashStore.DefaultStorageType

  constructor(opts?: StoragePreviousHashOpts) {
    if (opts?.namespace) this._namespace = opts.namespace
    if (opts?.type) this._type = opts.type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._storage = (store as any)[this.type].namespace(this.namespace)
  }

  get namespace() {
    return this._namespace
  }

  get type(): Storage {
    return this._type
  }

  private get storage(): StoreBase {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!this?._storage) this._storage = (store as any)[this.type].namespace(this.namespace) as StoreBase
    return this._storage
  }

  async getItem(address: Address): Promise<Hash | null> {
    const value = await this.storage.get(address)
    return value ?? null
  }

  async removeItem(address: Address): Promise<void> {
    await this.storage.remove(address)
  }

  async setItem(address: Address, previousHash: Hash): Promise<void> {
    await this.storage.set(address, previousHash)
  }
}
