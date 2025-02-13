import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { Hash, Hex } from '@xylabs/hex'
import { fulfilled } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import type {
  ArchivistInsertQuery,
  ArchivistModuleEventData,
  ArchivistNextOptions,
  IndexDescription,
} from '@xyo-network/archivist-model'
import { ArchivistInsertQuerySchema } from '@xyo-network/archivist-model'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { creatableModule } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'
import type { Database, RootDatabase } from 'lmdb'
import { open } from 'lmdb'

import { LmdbArchivistConfigSchema } from './Config.ts'
import type { LmdbArchivistParams } from './Params.ts'

@creatableModule()
export class LmdbArchivist<
  TParams extends LmdbArchivistParams = LmdbArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, LmdbArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = LmdbArchivistConfigSchema

  protected static readonly dataHashIndex: IndexDescription = {
    key: { _dataHash: 1 }, multiEntry: false, unique: false,
  }

  protected static readonly sequenceIndex: IndexDescription = {
    key: { _sequence: 1 }, multiEntry: false, unique: true,
  }

  protected dataHashIndex!: Database<Hash, string>
  protected db!: RootDatabase
  protected hashIndex!: Database<WithStorageMeta<Payload>, Hash>
  protected sequenceIndex!: Database<Hash, Hex>

  get dbName() {
    return assertEx(this.config.dbName, () => 'No dbName specified')
  }

  get folderPath() {
    return `${this.location}/${this.config.dbName}/${this.storeName}`
  }

  get location() {
    return assertEx(this.config.location, () => 'No location specified')
  }

  get storeName() {
    return assertEx(this.config.storeName, () => 'No storeName specified')
  }

  override async startHandler(): Promise<boolean> {
    await super.startHandler()

    // Open LMDB database
    this.db = open({
      path: this.folderPath,
      maxDbs: 3, // Payloads, dataHashIndex, sequenceIndex
    })

    // Open sub-databases
    this.hashIndex = this.db.openDB<WithStorageMeta<Payload>, Hash>({ name: 'payloads' })
    this.dataHashIndex = this.db.openDB<Hash, string>({ name: 'dataHashIndex' })
    this.sequenceIndex = this.db.openDB<Hash, Hex>({ name: 'sequenceIndex' })

    if (this.config.clearStoreOnStart) {
      await this.clearHandler()
    }
    return true
  }

  protected override allHandler(): WithStorageMeta<Payload>[] {
    return [...this.hashIndex.getRange({})].map(entry => entry.value).sort(PayloadBuilder.compareStorageMeta)
  }

  protected override async clearHandler(): Promise<void> {
    // Ensure all operations are synchronous within transaction
    await this.db.transaction(() => {
      this.hashIndex.clearSync()
      this.dataHashIndex.clearSync()
      this.sequenceIndex.clearSync()
    })
    return this.emit('cleared', { mod: this })
  }

  protected override async commitHandler(): Promise<BoundWitness[]> {
    const payloads = this.allHandler()
    const settled = await Promise.allSettled(
      Object.values((await this.parentArchivists()).commit ?? []).map(async (parent) => {
        const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
        const query = await this.bindQuery(queryPayload, payloads)
        return (await parent?.query(query[0], query[1]))?.[0]
      }).filter(exists),
    )
    await this.clearHandler()
    return settled.filter(fulfilled).map(result => result.value).filter(exists)
  }

  protected override async deleteHandler(hashes: Hash[]): Promise<Hash[]> {
    await this.db.transaction(() => {
      for (const hash of hashes) {
        const payload = this.hashIndex.get(hash)
        if (payload) {
          this.hashIndex.remove(hash)
          this.dataHashIndex.remove(payload._dataHash)
          this.sequenceIndex.remove(payload._sequence)
        }
      }
    })
    return hashes
  }

  protected override getHandler(hashes: Hash[]): WithStorageMeta<Payload>[] {
    return hashes.map((hash) => {
      const byHash = this.hashIndex.get(hash)
      if (byHash) return byHash
      const byDataHash = this.dataHashIndex.get(hash)
      if (byDataHash) return this.hashIndex.get(byDataHash)
    }).filter(exists)
  }

  protected override async insertHandler(payloads: WithStorageMeta<Payload>[]): Promise<WithStorageMeta<Payload>[]> {
    await this.db.transaction(() => {
      for (const payload of payloads) {
        this.hashIndex.put(payload._hash, payload)
        this.dataHashIndex.put(payload._dataHash, payload._hash)
        this.sequenceIndex.put(payload._sequence, payload._hash)
      }
    })
    return payloads
  }

  protected override nextHandler(options?: ArchivistNextOptions): WithStorageMeta<Payload>[] {
    const {
      limit = 100, cursor, order, open = true,
    } = options ?? {}

    let all = this.allHandler()
    if (order === 'desc') {
      all = all.reverse()
    }
    const startIndex = cursor
      ? all.findIndex(({ _sequence }) => _sequence === cursor) + (open ? 1 : 0)
      : 0
    return all.slice(startIndex, startIndex + limit)
  }
}
