import { asSchema, type Query } from '@xyo-network/payload-model'

export const ModuleManifestQuerySchema = asSchema('network.xyo.query.module.manifest', true)
export type ModuleManifestQuerySchema = typeof ModuleManifestQuerySchema

export type ModuleManifestQuery = Query<{
  maxDepth?: number
  schema: ModuleManifestQuerySchema
}>
