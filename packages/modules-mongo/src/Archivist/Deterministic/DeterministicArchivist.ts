import { staticImplements } from '@xylabs/static-implements'
import { ArchivistConfigSchema } from '@xyo-network/archivist'
import { MongoDBArchivist, MongoDBArchivistConfig, MongoDBArchivistConfigSchema, MongoDBArchivistParams } from '@xyo-network/archivist-mongodb'
import { WithLabels } from '@xyo-network/module-model'

import { MongoDBStorageClassLabels } from '../../Mongo'

export const MongoDBDeterministicArchivistConfigSchema = MongoDBArchivistConfigSchema
export type MongoDBDeterministicArchivistConfigSchema = typeof MongoDBDeterministicArchivistConfigSchema

export type MongoDBDeterministicArchivistConfig = MongoDBArchivistConfig

export type MongoDBDeterministicArchivistParams = MongoDBArchivistParams

@staticImplements<WithLabels<MongoDBStorageClassLabels>>()
export class MongoDBDeterministicArchivist<
  TParams extends MongoDBDeterministicArchivistParams = MongoDBDeterministicArchivistParams,
> extends MongoDBArchivist<TParams> {
  static override configSchemas = [MongoDBDeterministicArchivistConfigSchema, MongoDBArchivistConfigSchema, ArchivistConfigSchema]
  static labels = MongoDBStorageClassLabels
}
