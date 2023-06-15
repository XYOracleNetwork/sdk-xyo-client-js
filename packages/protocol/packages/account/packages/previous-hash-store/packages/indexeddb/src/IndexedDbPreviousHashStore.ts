import { assertEx } from '@xylabs/assert'
import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { DBSchema, IDBPDatabase, openDB } from 'idb'

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

interface PreviousHashStoreSchema {
  'previous-hash-store': {
    key: string
    value: string
  }
}

export class IndexedDbPreviousHashStore implements PreviousHashStore {
  static readonly DefaultDbName = 'xyo'
  static readonly DefaultStoreName = 'previous-hash-store'

  private readonly _db: Promise<IDBPDatabase<PreviousHashStoreSchema>>

  constructor(protected readonly opts?: IndexedDbPreviousHashStoreOpts) {
    const dbName = this.dbName
    const storeName = this.storeName
    this._db = openDB<PreviousHashStoreSchema>(dbName, 1, {
      upgrade(db) {
        db.createObjectStore(storeName)
      },
    })
  }

  /**
   * The database name. If not supplied via opts, it defaults
   * to DefaultDbName.
   */
  get dbName() {
    return this.opts?.dbName ?? IndexedDbPreviousHashStore.DefaultDbName
  }

  /**
   * The name of the object store. If not supplied via opts, it defaults
   * to DefaultStoreName.
   */
  get storeName() {
    return this.opts?.storeName ?? IndexedDbPreviousHashStore.DefaultStoreName
  }

  async getItem(address: string): Promise<string | null> {
    const value = await (await this._db).get(this.storeName, address)
    return value ?? null
  }
  async removeItem(address: string): Promise<void> {
    await (await this._db).delete(this.storeName, address)
  }
  async setItem(address: string, previousHash: string): Promise<void> {
    await (await this._db).put(this.storeName, previousHash, address)
  }
}
