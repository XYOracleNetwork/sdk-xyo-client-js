import { Query } from '@xyo-network/payload-model'

export type ModuleManifestQuerySchema = 'network.xyo.query.module.manifest'
export const ModuleManifestQuerySchema: ModuleManifestQuerySchema = 'network.xyo.query.module.manifest'

export type ModuleManifestQuery = Query<{
  maxDepth?: number
  schema: ModuleManifestQuerySchema
}>
