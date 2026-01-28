import { asSchema } from '@xyo-network/payload-model'

export const MongoDBModuleConfigSchema = asSchema('network.xyo.module.mongodb.config', true)
export type MongoDBModuleConfigSchema = typeof MongoDBModuleConfigSchema
