import { staticImplements } from '@xylabs/static-implements'
import { ArchivistConfigSchema } from '@xyo-network/archivist'
import { MongoDBArchivist, MongoDBArchivistConfig, MongoDBArchivistConfigSchema, MongoDBArchivistParams } from '@xyo-network/archivist-mongodb'
import { Labels, WithLabels } from '@xyo-network/module-model'

export const MongoDBDeterministicArchivistConfigSchema = MongoDBArchivistConfigSchema
export type MongoDBDeterministicArchivistConfigSchema = typeof MongoDBDeterministicArchivistConfigSchema

export type MongoDBDeterministicArchivistConfig = MongoDBArchivistConfig

export type MongoDBDeterministicArchivistParams = MongoDBArchivistParams

interface MongoStorageClassLabels extends Labels {
  'network.xyo.storage.class': 'mongodb'
}

const MongoStorageClassLabels: MongoStorageClassLabels = {
  'network.xyo.storage.class': 'mongodb',
}

@staticImplements<WithLabels<MongoStorageClassLabels>>()
export class MongoDBDeterministicArchivist<
  TParams extends MongoDBDeterministicArchivistParams = MongoDBDeterministicArchivistParams,
> extends MongoDBArchivist<TParams> {
  static override configSchemas = [MongoDBDeterministicArchivistConfigSchema, MongoDBArchivistConfigSchema, ArchivistConfigSchema]
  static labels = MongoStorageClassLabels
}
