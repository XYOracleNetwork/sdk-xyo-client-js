import { ArchivistConfigSchema } from '@xyo-network/archivist'
import { MongoDBArchivist, MongoDBArchivistConfig, MongoDBArchivistConfigSchema, MongoDBArchivistParams } from '@xyo-network/archivist-mongodb'

export const MongoDBDeterministicArchivistConfigSchema = MongoDBArchivistConfigSchema
export type MongoDBDeterministicArchivistConfigSchema = typeof MongoDBDeterministicArchivistConfigSchema

export type MongoDBDeterministicArchivistConfig = MongoDBArchivistConfig

export type MongoDBDeterministicArchivistParams = MongoDBArchivistParams

export class MongoDBDeterministicArchivist<
  TParams extends MongoDBDeterministicArchivistParams = MongoDBDeterministicArchivistParams,
> extends MongoDBArchivist<TParams> {
  static override configSchemas = [MongoDBDeterministicArchivistConfigSchema, MongoDBArchivistConfigSchema, ArchivistConfigSchema]
}
