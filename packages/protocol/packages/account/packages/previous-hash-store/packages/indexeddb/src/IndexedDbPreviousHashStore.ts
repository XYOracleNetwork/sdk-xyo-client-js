import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { clear, createStore, delMany, entries, getMany, setMany, UseStore } from 'idb-keyval'

export type IndexedDbPreviousHashStoreOpts = {
  /**
   * The database name
   */
  dbName?: string
  //namespace?: string
  /**
   * The name of the object store
   */
  storeName?: string
}

export class IndexedDbPreviousHashStore implements PreviousHashStore {
  static readonly DefaultNamespace = 'xyo-previous-hash-store'
  private _dbName = IndexedDbPreviousHashStore.DefaultNamespace

  constructor(opts?: IndexedDbPreviousHashStoreOpts) {
    if (opts?.dbName) this._dbName = opts.dbName
  }

  get namespace() {
    return this._dbName
  }

  async getItem(address: string): Promise<string | null> {
    const value = await this.IndexedDb.get(address)
    return value ?? null
  }
  async removeItem(address: string): Promise<void> {
    await this.IndexedDb.remove(address)
  }
  async setItem(address: string, previousHash: string): Promise<void> {
    await this.IndexedDb.set(address, previousHash)
  }
}
