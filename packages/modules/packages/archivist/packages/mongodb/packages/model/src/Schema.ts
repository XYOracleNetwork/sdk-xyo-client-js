import { asSchema } from '@xyo-network/payload-model'

export const MongoDBArchivistConfigSchema = asSchema('network.xyo.archivist.mongodb.config', true)
export type MongoDBArchivistConfigSchema = typeof MongoDBArchivistConfigSchema
