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
  keyPrefix?: string | undefined
  private _namespace = StoragePreviousHashStore.DefaultNamespace
  private _storage: StoreBase | undefined
  private _type: Storage = StoragePreviousHashStore.DefaultStorageType

  constructor(opts?: StoragePreviousHashOpts) {
    if (opts?.namespace) this._namespace = opts.namespace
    if (opts?.type) this._type = opts.type
    this._storage = store[this.type].namespace(this.namespace)
  }

  get namespace() {
    return this._namespace
  }

  get type(): Storage {
    return this._type
  }

  private get storage(): StoreBase {
    if (!this?._storage) this._storage = store[this.type].namespace(this.namespace)
    return this._storage
  }

  async getItem(address: string): Promise<string | null> {
    const value = await this.storage.get(address)
    return value ?? null
  }
  async removeItem(address: string): Promise<void> {
    await this.storage.remove(address)
  }
  async setItem(address: string, previousHash: string): Promise<void> {
    await this.storage.set(address, previousHash)
  }
}
