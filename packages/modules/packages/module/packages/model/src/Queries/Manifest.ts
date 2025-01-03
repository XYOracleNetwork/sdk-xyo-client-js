import type { Query } from '@xyo-network/payload-model'

export const ModuleManifestQuerySchema = 'network.xyo.query.module.manifest' as const
export type ModuleManifestQuerySchema = typeof ModuleManifestQuerySchema

export type ModuleManifestQuery = Query<{
  maxDepth?: number
  schema: ModuleManifestQuerySchema
}>
