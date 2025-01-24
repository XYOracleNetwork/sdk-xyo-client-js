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
import { Level } from 'level'

import { LevelDbArchivistConfigSchema } from './Config.ts'
import { LevelDbArchivistParams } from './Params.ts'

export interface PayloadStore {
  [s: string]: WithStorageMeta
}

export type AbstractPayloadLevel = AbstractLevel<string | Buffer | Uint8Array, Hash, WithStorageMeta<Payload>>
export type AbstractPayloadSubLevel = AbstractSublevel<AbstractPayloadLevel, string | Buffer | Uint8Array, Hash, WithStorageMeta<Payload>>

export abstract class AbstractLevelDbArchivist<
  TParams extends LevelDbArchivistParams = LevelDbArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, LevelDbArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = LevelDbArchivistConfigSchema

  get folderPath() {
    return `${assertEx(this.config.location, () => 'No location specified')}/${assertEx(this.config.dbName, () => 'No dbName specified')}`
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
    return await this.withDb(async (db) => {
      const values = [...((await db.values().all()).values())]
      return values.filter(exists).sort(PayloadBuilder.compareStorageMeta)
    })
  }

  protected override async clearHandler(): Promise<void> {
    await this.withDb(async (db) => {
      await db.clear()
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
    await this.withDb(async (db) => {
      await db.batch(hashes.map(hash => ({ type: 'del', key: hash })))
    })
    return hashes
  }

  protected override async getHandler(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    return await this.withDb(async (db) => {
      return (await db.getMany(hashes)).filter(exists)
    })
  }

  protected override async insertHandler(payloads: WithStorageMeta<Payload>[]): Promise<WithStorageMeta<Payload>[]> {
    const payloadsWithMeta = payloads.sort(PayloadBuilder.compareStorageMeta)
    const batchCommands: Array<AbstractBatchOperation<AbstractPayloadLevel, Hash, WithStorageMeta<Payload>>> = payloadsWithMeta.map(payload => ({
      type: 'put', key: payload._hash, value: payload,
    }))
    await this.withDb(async (db) => {
      await db.batch(batchCommands)
    })
    return payloadsWithMeta
  }

  protected override async nextHandler(options?: ArchivistNextOptions): Promise<WithStorageMeta<Payload>[]> {
    const {
      limit, cursor, order,
    } = options ?? {}
    let all = await this.allHandler()
    console.log('all', all)
    if (order === 'desc') {
      all = all.reverse()
    }
    const startIndex = cursor
      ? AbstractLevelDbArchivist.findIndexFromCursor(all, cursor) + 1
      : 0
    const result = all.slice(startIndex, limit ? startIndex + limit : undefined)
    return result
  }

  protected override async startHandler(): Promise<boolean> {
    await super.startHandler()
    if (this.config.clearStoreOnStart) {
      await this.clearHandler()
    }
    return true
  }

  abstract withDb<T>(func: (db: AbstractPayloadSubLevel) => Promisable<T>): Promisable<T>
}

@creatableModule()
export class LevelDbArchivist extends AbstractLevelDbArchivist {
  override async withDb<T>(func: (db: AbstractPayloadSubLevel) => Promisable<T>): Promise<T> {
    const db: AbstractPayloadLevel = new Level<Hash, WithStorageMeta<Payload>>(this.folderPath, { keyEncoding: 'utf8', valueEncoding: 'json' })
    const subLevel: AbstractPayloadSubLevel = db.sublevel<Hash, WithStorageMeta<Payload>>(this.storeName, { keyEncoding: 'utf8', valueEncoding: 'json' })
    try {
      return await func(subLevel)
    } finally {
      await db.close()
    }
  }
}
