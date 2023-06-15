import { assertEx } from '@xylabs/assert'
import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { IDBPDatabase, openDB } from 'idb'

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

  private readonly _db: Promise<IDBPDatabase<unknown>>

  constructor(protected readonly opts?: IndexedDbPreviousHashStoreOpts) {
    const dbName = this.dbName
    const storeName = this.storeName
    this._db = openDB(dbName, 1, {
      upgrade(db) {
        db.createObjectStore(storeName)
      },
    })
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

  async getItem(address: string): Promise<string | null> {
    const value = (await this._db).get(this.storeName, address)
    return value ?? null
  }
  async removeItem(address: string): Promise<void> {
    await (await this._db).delete(this.storeName, address)
  }
  async setItem(address: string, previousHash: string): Promise<void> {
    await (await this._db).put(this.storeName, previousHash, address)
  }
}
