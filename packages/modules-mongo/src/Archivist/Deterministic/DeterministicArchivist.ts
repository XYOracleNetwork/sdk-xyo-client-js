import { staticImplements } from '@xylabs/static-implements'
import { ArchivistConfigSchema } from '@xyo-network/archivist'
import { MongoDBArchivist, MongoDBArchivistConfig, MongoDBArchivistConfigSchema, MongoDBArchivistParams } from '@xyo-network/archivist-mongodb'

export const MongoDBDeterministicArchivistConfigSchema = MongoDBArchivistConfigSchema
export type MongoDBDeterministicArchivistConfigSchema = typeof MongoDBDeterministicArchivistConfigSchema

export type MongoDBDeterministicArchivistConfig = MongoDBArchivistConfig

export type MongoDBDeterministicArchivistParams = MongoDBArchivistParams

interface TagsDictionary {
  [key: string]: string
}

interface WithTags<T extends TagsDictionary> {
  tags: T
}

interface MongoStorageClassTags extends TagsDictionary {
  storageClass: 'mongodb'
}

const mongoStorageClassTags: MongoStorageClassTags = {
  storageClass: 'mongodb',
}

@staticImplements<WithTags<MongoStorageClassTags>>()
export class MongoDBDeterministicArchivist<
  TParams extends MongoDBDeterministicArchivistParams = MongoDBDeterministicArchivistParams,
> extends MongoDBArchivist<TParams> {
  static override configSchemas = [MongoDBDeterministicArchivistConfigSchema, MongoDBArchivistConfigSchema, ArchivistConfigSchema]
  static tags = mongoStorageClassTags
}
