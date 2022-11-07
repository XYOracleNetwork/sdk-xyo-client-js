import 'reflect-metadata'

import { assertEx } from '@xylabs/assert'
import { XyoArchivistQuery } from '@xyo-network/archivist'
import { ModuleQueryResult } from '@xyo-network/module'
import { UpsertResult, User, UserArchivist, UserWithoutId } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { inject, injectable } from 'inversify'
import { ObjectId, WithId } from 'mongodb'

import { MONGO_TYPES } from '../../types'

interface IUpsertFilter {
  $or: {
    address?: string
    email?: string
  }[]
}

@injectable()
export class MongoDBUserArchivist implements UserArchivist {
  constructor(@inject(MONGO_TYPES.UserSdkMongo) protected readonly db: BaseMongoSdk<User>) {}
  get address(): string {
    throw new Error('Module query not implemented for MongoDBUserArchivist')
  }

  async find(query?: Partial<User>): Promise<User[]> {
    if (!query) return []
    return (await this.db.find(query)).limit(1).toArray()
  }
  async get(ids: string[]): Promise<Array<WithId<User> | null>> {
    assertEx(ids.length === 1, 'Retrieval of multiple users not supported')
    const id = assertEx(ids.pop(), 'Missing user id')
    const user = await this.db.findOne({ _id: new ObjectId(id.toLowerCase()) })
    return user ? [user] : [null]
  }

  async insert(users: UserWithoutId[]): Promise<WithId<User & UpsertResult>[]> {
    return await this.db.useCollection(async (collection) => {
      const filter: IUpsertFilter = { $or: [] }
      assertEx(users.length === 1, 'Insertion of multiple users not supported')
      const user = assertEx(users.pop(), 'Missing user')
      const { address, email } = user
      if (!address && !email) {
        throw new Error('Invalid user creation attempted. Either email or address is required.')
      }
      if (address) {
        filter.$or.push({ address })
      }
      if (email) {
        filter.$or.push({ email })
      }
      const result = await collection.findOneAndUpdate(filter, { $set: user }, { returnDocument: 'after', upsert: true })
      if (result.ok && result.value) {
        const updated = !!result?.lastErrorObject?.updatedExisting || false
        return [{ ...result.value, updated }]
      }
      throw new Error('Insert Failed')
    })
  }

  queries(): string[] {
    throw new Error('Module query not implemented for MongoDBUserArchivist')
  }
  query(_query: XyoArchivistQuery, _payloads: XyoPayload[]): Promise<ModuleQueryResult> {
    throw new Error('Module query not implemented for MongoDBUserArchivist')
  }
  queryable(_schema: string): boolean {
    throw new Error('Module query not implemented for MongoDBUserArchivist')
  }
}
