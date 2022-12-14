import { assertEx } from '@xylabs/sdk-js'
import { Collection, Document, Filter, FindCursor, MongoClient, OptionalUnlessRequiredId, WithId } from 'mongodb'

import { BaseMongoSdkConfig } from './Config'
import { MongoClientWrapper } from './Wrapper'

export class BaseMongoSdk<T extends Document> {
  public config: BaseMongoSdkConfig

  constructor(config: BaseMongoSdkConfig) {
    this.config = config
  }

  public get uri() {
    return (
      this.config.dbConnectionString ??
      `mongodb+srv://${this.config.dbUserName}:${this.config.dbPassword}@${this.config.dbDomain}.mongodb.net/${this.config.dbName}?retryWrites=true&w=majority`
    )
  }

  public async find(filter: Filter<T>) {
    return await this.useCollection<FindCursor<WithId<T>>>((collection: Collection<T>) => {
      return collection.find(filter)
    })
  }

  public async findOne(filter: Filter<T>) {
    return await this.useCollection<WithId<T> | null>(async (collection: Collection<T>) => {
      return await collection.findOne(filter)
    })
  }

  public async insertMany(items: OptionalUnlessRequiredId<T>[]) {
    return await this.useCollection(async (collection: Collection<T>) => {
      return await collection.insertMany(items)
    })
  }

  public async insertOne(item: OptionalUnlessRequiredId<T>) {
    return await this.useCollection(async (collection: Collection<T>) => {
      return await collection.insertOne(item)
    })
  }

  public async updateOne(filter: Filter<T>, fields: Partial<T>) {
    return await this.useCollection(async (collection: Collection<T>) => {
      return await collection.updateOne(filter, fields, { upsert: false })
    })
  }

  public async upsertOne(filter: Filter<T>, item: Partial<T>) {
    const { ...fields } = item
    return await this.useCollection(async (collection: Collection<T>) => {
      return await collection.updateOne(filter, fields, { upsert: true })
    })
  }

  public async useCollection<R>(func: (collection: Collection<T>) => Promise<R> | R) {
    return await this.useMongo<R>(async (client: MongoClient) => {
      return await func(client.db(this.config.dbName).collection<T>(this.config.collection))
    })
  }

  public async useMongo<R>(func: (client: MongoClient) => Promise<R> | R) {
    const wrapper = MongoClientWrapper.get(this.uri, this.config.maxPoolSize)
    const connection = await wrapper.connect()
    assertEx(connection, 'Connection failed')
    try {
      return await func(connection)
    } finally {
      await wrapper.disconnect()
    }
  }
}
