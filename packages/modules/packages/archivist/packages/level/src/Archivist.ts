import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Hash, Hex } from '@xylabs/hex'
import { fulfilled, Promisable } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  ArchivistNextOptions,
  ArchivistNextQuerySchema,
  buildStandardIndexName,
  IndexDescription,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { creatableModule } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'
import {
  AbstractBatchOperation, AbstractLevel, AbstractSublevel,
} from 'abstract-level'
import { Mutex } from 'async-mutex'
import { Level } from 'level'

import { LevelDbArchivistConfigSchema } from './Config.ts'
import { LevelDbArchivistParams } from './Params.ts'

/** Note: We have indexes as top level sublevels since making them a sublevel of a store, getting all the values of that store includes the sublevels  */

export interface PayloadStore {
  [s: string]: WithStorageMeta
}

export type AbstractPayloadLevel = AbstractLevel<string | Buffer | Uint8Array, Hash, WithStorageMeta<Payload>>
export type AbstractPayloadSubLevel = AbstractSublevel<AbstractPayloadLevel, string | Buffer | Uint8Array, Hash, WithStorageMeta<Payload>>
export type AbstractIndexSubLevel<T> = AbstractSublevel<AbstractPayloadLevel, string | Buffer | Uint8Array, T, Hash>

const indexSubLevelName = (storeName: string, indexName: string) => {
  return `_${storeName}|${indexName}`
}

export abstract class AbstractLevelDbArchivist<
  TParams extends LevelDbArchivistParams = LevelDbArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, LevelDbArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = LevelDbArchivistConfigSchema

  private static readonly dataHashIndex: IndexDescription = {
    key: { _dataHash: 1 }, multiEntry: false, unique: false,
  }

  private static readonly sequenceIndex: IndexDescription = {
    key: { _sequence: 1 }, multiEntry: false, unique: true,
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  static readonly dataHashIndexName = buildStandardIndexName(AbstractLevelDbArchivist.dataHashIndex)
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static readonly sequenceIndexName = buildStandardIndexName(AbstractLevelDbArchivist.sequenceIndex)

  get dbName() {
    return assertEx(this.config.dbName, () => 'No dbName specified')
  }

  get folderPath() {
    return `${this.location}/${this.storeName}`
  }

  get location() {
    return assertEx(this.config.location, () => 'No location specified')
  }

  override get queries() {
    return [
      ArchivistAllQuerySchema,
      ArchivistDeleteQuerySchema,
      ArchivistClearQuerySchema,
      ArchivistInsertQuerySchema,
      ArchivistCommitQuerySchema,
      ArchivistNextQuerySchema,
      ...super.queries,
    ]
  }

  get storeName() {
    return assertEx(this.config.storeName, () => 'No storeName specified')
  }

  private static findIndexFromCursor(payloads: WithStorageMeta[], cursor: Hex) {
    const index = payloads.findIndex(({ _sequence }) => _sequence === cursor)
    if (index === -1) {
      return Infinity // move to the end
    }
    return index
  }

  protected override async allHandler(): Promise<WithStorageMeta<Payload>[]> {
    return await this.withStore(async (db) => {
      const values = [...(await db.values().all())]
      return values.filter(exists).sort(PayloadBuilder.compareStorageMeta)
    })
  }

  protected override async clearHandler(): Promise<void> {
    await this.withDb(async (db) => {
      await db.clear()
    })
    await this.withDataHashIndex(async (index) => {
      await index.clear()
    })
    await this.withSequenceIndex(async (index) => {
      await index.clear()
    })
    return this.emit('cleared', { mod: this })
  }

  protected override async commitHandler(): Promise<BoundWitness[]> {
    const payloads = assertEx(await this.allHandler(), () => 'Nothing to commit')
    const settled = await Promise.allSettled(
      Object.values((await this.parentArchivists()).commit ?? [])?.map(async (parent) => {
        const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
        const query = await this.bindQuery(queryPayload, payloads)
        return (await parent?.query(query[0], query[1]))?.[0]
      }).filter(exists),
    )
    await this.clearHandler()
    return settled.filter(fulfilled).map(result => result.value).filter(exists)
  }

  protected override async deleteHandler(hashes: Hash[]): Promise<Hash[]> {
    // not using the getHandler since duplicate data hashes are not handled
    const payloadsWithMeta = (await this.allHandler()).filter(({ _hash, _dataHash }) => hashes.includes(_hash) || hashes.includes(_dataHash))
    // Delete the payloads
    const batchCommands: Array<AbstractBatchOperation<AbstractPayloadSubLevel, Hash, WithStorageMeta<Payload>>> = payloadsWithMeta.map(payload => ({
      type: 'del',
      key: payload._hash,
    }))

    await this.withStore(async (store) => {
      await store.batch(batchCommands)
    })

    // Delete the dataHash indexes
    const batchDataHashIndexCommands: Array<AbstractBatchOperation<AbstractPayloadSubLevel, string, Hash>> = payloadsWithMeta.map(payload => ({
      type: 'del',
      key: payload._dataHash,
    }))

    await this.withDataHashIndex(async (index) => {
      await index.batch(batchDataHashIndexCommands)
    })

    // Delete the sequence indexes
    const batchSequenceIndexCommands: Array<AbstractBatchOperation<AbstractPayloadSubLevel, Hex, Hash>> = payloadsWithMeta.map(payload => ({
      type: 'del',
      key: payload._sequence,
    }))

    await this.withSequenceIndex(async (index) => {
      await index.batch(batchSequenceIndexCommands)
    })

    return hashes
  }

  protected override async getHandler(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    const foundByHash = await this.withStore(async (store) => {
      return (await store.getMany(hashes)).filter(exists)
    })
    const remainingHashes = hashes.filter(hash => !foundByHash.some(({ _hash }) => _hash === hash))
    const hashesFromDataHashes = await this.withDataHashIndex(async (index) => {
      return (await index.getMany(remainingHashes)).filter(exists)
    })
    const foundByDataHash = hashesFromDataHashes.length > 0
      ? await this.withStore(async (store) => {
        return (await store.getMany(hashesFromDataHashes)).filter(exists)
      })
      : []
    const result = [...foundByHash, ...foundByDataHash].sort(PayloadBuilder.compareStorageMeta)
    return result
  }

  protected override async insertHandler(payloads: WithStorageMeta<Payload>[]): Promise<WithStorageMeta<Payload>[]> {
    // Insert the payloads
    const payloadsWithMeta = payloads.sort(PayloadBuilder.compareStorageMeta)
    const batchCommands: Array<AbstractBatchOperation<AbstractPayloadSubLevel, Hash, WithStorageMeta<Payload>>> = payloadsWithMeta.map(payload => ({
      type: 'put', key: payload._hash, value: payload, keyEncoding: 'utf8', valueEncoding: 'json',
    }))
    await this.withStore(async (store) => {
      await store.batch(batchCommands)
    })

    // Insert the dataHash indexes
    // Note: We use the dataHash|hash for the key to allow for multiple entries
    const batchDataHashIndexCommands: Array<AbstractBatchOperation<AbstractPayloadLevel, string, Hash>> = payloadsWithMeta.map(payload => ({
      type: 'put', key: payload._dataHash, value: payload._hash, keyEncoding: 'utf8', valueEncoding: 'utf8',
    }))
    await this.withDataHashIndex(async (index) => {
      await index.batch(batchDataHashIndexCommands)
    })

    // Insert the sequence indexes
    // Note: We use the dataHash|hash for the key to allow for multiple entries
    const batchSequenceIndexCommands: Array<AbstractBatchOperation<AbstractPayloadLevel, Hex, Hash>> = payloadsWithMeta.map(payload => ({
      type: 'put', key: payload._sequence, value: payload._hash, keyEncoding: 'utf8', valueEncoding: 'utf8',
    }))
    await this.withSequenceIndex(async (index) => {
      await index.batch(batchSequenceIndexCommands)
    })

    return payloadsWithMeta
  }

  protected override async nextHandler(options?: ArchivistNextOptions): Promise<WithStorageMeta<Payload>[]> {
    const {
      limit, cursor, order, open,
    } = options ?? {}
    let all = await this.allHandler()
    if (order === 'desc') {
      all = all.reverse()
    }
    const startIndex = cursor
      ? AbstractLevelDbArchivist.findIndexFromCursor(all, cursor) + (open ? 0 : 1)
      : 0
    const result = all.slice(startIndex, limit ? startIndex + limit : undefined)
    return result
  }

  protected override async startHandler(): Promise<boolean> {
    await super.startHandler()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    await this.withStore(() => {})
    if (this.config.clearStoreOnStart) {
      await this.clearHandler()
    }
    return true
  }

  protected withDataHashIndex<T>(func: (index: AbstractIndexSubLevel<string>) => Promisable<T>): Promisable<T> {
    return this.withDb(async (db) => {
      const index = db.sublevel<string, Hash>(
        indexSubLevelName(this.storeName, AbstractLevelDbArchivist.dataHashIndexName),
        { keyEncoding: 'utf8', valueEncoding: 'utf8' },
      )
      return await func(index)
    })
  }

  protected withSequenceIndex<T>(func: (index: AbstractIndexSubLevel<Hex>) => Promisable<T>): Promisable<T> {
    return this.withDb(async (db) => {
      const index = db.sublevel<Hex, Hash>(
        indexSubLevelName(this.storeName, AbstractLevelDbArchivist.sequenceIndexName),
        { keyEncoding: 'utf8', valueEncoding: 'utf8' },
      )
      return await func(index)
    })
  }

  protected async withStore<T>(func: (store: AbstractPayloadSubLevel) => Promisable<T>): Promise<T> {
    return await this.withDb(async (db) => {
      const subLevel: AbstractPayloadSubLevel = db.sublevel<Hash, WithStorageMeta<Payload>>(this.storeName, { keyEncoding: 'utf8', valueEncoding: 'json' })
      return await func(subLevel)
    })
  }

  protected abstract withDb<T>(func: (db: AbstractPayloadLevel) => Promisable<T>): Promisable<T>
}

@creatableModule()
export class LevelDbArchivist extends AbstractLevelDbArchivist {
  private dbMutex = new Mutex()
  protected override async withDb<T>(func: (db: AbstractPayloadLevel) => Promisable<T>): Promise<T> {
    return await this.dbMutex.runExclusive(async () => {
      const db: AbstractPayloadLevel = new Level<Hash, WithStorageMeta<Payload>>(this.folderPath, { keyEncoding: 'utf8', valueEncoding: 'json' })
      try {
        return await func(db)
      } finally {
        await db.close()
      }
    })
  }
}
