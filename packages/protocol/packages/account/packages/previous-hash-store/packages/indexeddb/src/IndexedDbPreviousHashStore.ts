import { assertEx } from '@xylabs/assert'
import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { createStore, del, get, set, UseStore } from 'idb-keyval'

export type IndexedDbPreviousHashStoreOpts = {
  /**
   * The database name
   */
  dbName?: string
  /**
   * The name of the object store
   */
  storeName?: string
}

export class IndexedDbPreviousHashStore implements PreviousHashStore {
  static readonly DefaultDbName = 'xyo'
  static readonly DefaultStoreName = 'previous-hash-store'

  private _db: UseStore | undefined

  constructor(protected readonly opts?: IndexedDbPreviousHashStoreOpts) {
    this._db = createStore(this.dbName, this.storeName)
  }

  /**
   * The database name. If not supplied via opts, it defaults
   * to `xyo`.
   */
  get dbName() {
    return this.opts?.dbName ?? IndexedDbPreviousHashStore.DefaultDbName
  }

  /**
   * The name of the object store. If not supplied via opts, it defaults
   * to `previous-hash-store`. The limitation of the current IndexedDB wrapper we're
   * using is that it only supports a single object store per DB. See here:
   * https://github.com/jakearchibald/idb-keyval/blob/main/custom-stores.md#defining-a-custom-database--store-name
   * If this becomes a problem or we need migrations/transactions, we can
   * move to this more-flexible library, which they recommend (and who
   * recommends them for our simple use case of key-value storage):
   * https://www.npmjs.com/package/idb
   */
  get storeName() {
    return this.opts?.storeName ?? IndexedDbPreviousHashStore.DefaultStoreName
  }

  private get db(): UseStore {
    return assertEx(this._db, 'DB not initialized')
  }

  async getItem(address: string): Promise<string | null> {
    const value = await get(address, this.db)
    return value ?? null
  }
  async removeItem(address: string): Promise<void> {
    await del(address, this.db)
  }
  async setItem(address: string, previousHash: string): Promise<void> {
    await set(address, previousHash, this.db)
  }
}
