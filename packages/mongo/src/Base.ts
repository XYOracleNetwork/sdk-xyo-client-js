import { assertEx } from '@xylabs/assert'
import { Collection, DeleteResult, Document, Filter, FindCursor, MongoClient, OptionalUnlessRequiredId, UpdateFilter, WithId } from 'mongodb'

import { BaseMongoSdkConfig } from './Config'
import { MongoClientWrapper } from './Wrapper'

export class BaseMongoSdk<T extends Document> {
  config: BaseMongoSdkConfig

  constructor(config: BaseMongoSdkConfig) {
    this.config = config
  }

  get uri() {
    return (
      this.config.dbConnectionString ??
      `mongodb+srv://${this.config.dbUserName}:${this.config.dbPassword}@${this.config.dbDomain}.mongodb.net/${this.config.dbName}?retryWrites=true&w=majority`
    )
  }

  async deleteOne(filter: Filter<T>) {
    return await this.useCollection<DeleteResult>(async (collection: Collection<T>) => {
      return await collection.deleteOne(filter)
    })
  }

  async find(filter: Filter<T>) {
    return await this.useCollection<FindCursor<WithId<T>>>((collection: Collection<T>) => {
      return collection.find(filter)
    })
  }

  async findOne(filter: Filter<T>) {
    return await this.useCollection<WithId<T> | null>(async (collection: Collection<T>) => {
      return await collection.findOne(filter)
    })
  }

  async insertMany(items: OptionalUnlessRequiredId<T>[]) {
    return await this.useCollection(async (collection: Collection<T>) => {
      return await collection.insertMany(items)
    })
  }

  async insertOne(item: OptionalUnlessRequiredId<T>) {
    return await this.useCollection(async (collection: Collection<T>) => {
      return await collection.insertOne(item)
    })
  }

  async updateOne(filter: Filter<T>, fields: UpdateFilter<T>) {
    return await this.useCollection(async (collection: Collection<T>) => {
      return await collection.updateOne(filter, fields, { upsert: false })
    })
  }

  async upsertOne(filter: Filter<T>, fields: UpdateFilter<T>) {
    return await this.useCollection(async (collection: Collection<T>) => {
      return await collection.updateOne(filter, fields, { upsert: true })
    })
  }

  async useCollection<R>(func: (collection: Collection<T>) => Promise<R> | R) {
    return await this.useMongo<R>(async (client: MongoClient) => {
      return await func(client.db(this.config.dbName).collection<T>(this.config.collection))
    })
  }

  async useMongo<R>(func: (client: MongoClient) => Promise<R> | R) {
    const wrapper = MongoClientWrapper.get(this.uri, this.config.maxPoolSize, this.config.closeDelay)
    const connection = await wrapper.connect()
    assertEx(connection, 'Connection failed')
    try {
      return await func(connection)
    } finally {
      await wrapper.disconnect()
    }
  }
}
