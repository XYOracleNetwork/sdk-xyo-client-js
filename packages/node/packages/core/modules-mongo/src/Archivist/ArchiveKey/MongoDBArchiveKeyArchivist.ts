import { assertEx } from '@xylabs/assert'
import { XyoArchiveKey } from '@xyo-network/api'
import { XyoArchivistQuery } from '@xyo-network/archivist'
import { ModuleQueryResult } from '@xyo-network/module'
import { ArchiveKeyArchivist } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { injectable } from 'inversify'
import { Collection, WithId } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'

const fromDb = (k: WithId<XyoArchiveKey>) => {
  return {
    archive: k.archive,
    created: k._id.getTimestamp().getTime(),
    key: k.key,
  }
}

export class MongoDBArchiveKeyArchivist implements ArchiveKeyArchivist {
  constructor(protected readonly keys: BaseMongoSdk<XyoArchiveKey> = getBaseMongoSdk<XyoArchiveKey>(COLLECTIONS.ArchiveKeys)) {}
  get address(): string {
    throw new Error('Module query not implemented for MongoDBArchiveKeyArchivist')
  }

  async find(filter: Partial<XyoArchiveKey>): Promise<XyoArchiveKey[]> {
    return (await (await this.keys.find(filter)).toArray()).map(fromDb)
  }
  async get(archives: string[]): Promise<XyoArchiveKey[]> {
    assertEx(archives.length === 1, 'Retrieval of multiple archives keys not supported')
    const archive = assertEx(archives.pop(), 'Missing archive')
    return (await (await this.keys.find({ archive })).toArray()).map(fromDb)
  }
  async insert(items: XyoArchiveKey[]): Promise<XyoArchiveKey[]> {
    assertEx(items.length === 1, 'Insertion of multiple archives keys not supported')
    const item = assertEx(items.pop(), 'Missing archive key')
    return await this.keys.useCollection(async (collection: Collection<XyoArchiveKey>) => {
      const result = await collection.insertOne({ ...item })
      if (result.acknowledged) {
        const key: XyoArchiveKey = {
          archive: item.archive,
          created: result.insertedId.getTimestamp().getTime(),
          key: item.key,
        }
        return [key]
      } else {
        throw new Error('Insert Failed')
      }
    })
  }

  queries(): string[] {
    throw new Error('Module query not implemented for MongoDBArchiveKeyArchivist')
  }
  query(_query: XyoArchivistQuery): Promise<ModuleQueryResult> {
    throw new Error('Module query not implemented for MongoDBArchiveKeyArchivist')
  }
  queryable(_schema: string): boolean {
    throw new Error('Module query not implemented for MongoDBArchiveKeyArchivist')
  }
}
