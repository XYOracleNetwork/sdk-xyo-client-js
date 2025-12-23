import type { Address, Hash } from '@xylabs/sdk-js'
import type { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import type { DBSchema, IDBPDatabase } from 'idb'
import { openDB } from 'idb'

export interface PreviousHashStoreSchemaV1 extends DBSchema {
  'previous-hash': {
    key: string
    value: string
  }
}

export class IndexedDbPreviousHashStore implements PreviousHashStore {
  static readonly CurrentSchemaVersion = 1
  private readonly db: Promise<IDBPDatabase<PreviousHashStoreSchemaV1>>

  constructor() {
    this.db = openDB<PreviousHashStoreSchemaV1>(
      this.dbName,
      IndexedDbPreviousHashStore.CurrentSchemaVersion,
      { upgrade: db => db.createObjectStore(this.storeName) },
    )
  }

  /**
   * The database name.
   */
  get dbName() {
    return 'xyo' as const
  }

  /**
   * The name of the object store.
   */
  get storeName() {
    return 'previous-hash' as const
  }

  async getItem(address: Address): Promise<Hash | null> {
    const value = (await (await this.db).get(this.storeName, address)) as Hash
    return value ?? null
  }

  async removeItem(address: Address): Promise<void> {
    await (await this.db).delete(this.storeName, address)
  }

  async setItem(address: Address, previousHash: string): Promise<void> {
    await (await this.db).put(this.storeName, previousHash, address)
  }
}
