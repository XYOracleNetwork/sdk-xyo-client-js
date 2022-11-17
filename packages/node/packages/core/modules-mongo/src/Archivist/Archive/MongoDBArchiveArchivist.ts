import { assertEx } from '@xylabs/assert'
import { XyoArchive } from '@xyo-network/api'
import { XyoArchivistQuery } from '@xyo-network/archivist'
import { ModuleQueryResult } from '@xyo-network/module'
import { ArchiveArchivist, EntityArchive, UpsertResult, XyoPayloadFilterPredicate } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Filter, SortDirection, WithId } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DefaultLimit, DefaultOrder } from '../../defaults'
import { getBaseMongoSdk } from '../../Mongo'

interface UpsertFilter {
  $and: [
    {
      archive: string
    },
    {
      user: string
    },
  ]
}

export class MongoDBArchiveArchivist implements ArchiveArchivist {
  constructor(protected readonly archives: BaseMongoSdk<EntityArchive> = getBaseMongoSdk<EntityArchive>(COLLECTIONS.Archives)) {}

  get address(): string {
    throw new Error('Module query not implemented for MongoDBArchiveArchivist')
  }

  async find(predicate?: XyoPayloadFilterPredicate<XyoArchive>): Promise<EntityArchive[]> {
    if (!predicate) return []
    const { archives, limit, offset, order, user } = predicate
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const sort: { [key: string]: SortDirection } = { $natural: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<EntityArchive> = {}
    if (archives?.length) filter.archive = { $in: archives }
    if (user) filter.user = user
    const skip = offset && offset > 0 ? offset : 0
    return (await this.archives.find(filter)).sort(sort).limit(parsedLimit).skip(skip).maxTimeMS(2000).toArray()
  }

  async get(archives: string[]): Promise<Array<EntityArchive | null>> {
    assertEx(archives.length === 1, 'Retrieval of multiple archives not supported')
    const archive = assertEx(archives.pop(), 'Missing archive')
    const result = await this.archives.findOne({ archive })
    return [result]
  }

  async insert(items: EntityArchive[]): Promise<(WithId<EntityArchive> & UpsertResult)[]> {
    return await this.archives.useCollection(async (collection) => {
      assertEx(items.length === 1, 'Insertion of multiple archives not supported')
      const item = assertEx(items.pop(), 'Missing archive')
      const { archive, user } = item
      if (!archive || !user) {
        throw new Error('Invalid archive creation attempted. Archive and user are required.')
      }
      const filter: UpsertFilter = { $and: [{ archive }, { user }] }
      const result = await collection.findOneAndUpdate(filter, { $set: item }, { returnDocument: 'after', upsert: true })
      if (result.ok && result.value) {
        const updated = !!result?.lastErrorObject?.updatedExisting || false
        return [{ ...result.value, updated }]
      }
      throw new Error('Insert Failed')
    })
  }

  queries(): string[] {
    throw new Error('Module query not implemented for MongoDBArchiveArchivist')
  }
  query(_query: XyoArchivistQuery): Promise<ModuleQueryResult> {
    throw new Error('Module query not implemented for MongoDBArchiveArchivist')
  }
  queryable(_schema: string): boolean {
    throw new Error('Module query not implemented for MongoDBArchiveArchivist')
  }
}
