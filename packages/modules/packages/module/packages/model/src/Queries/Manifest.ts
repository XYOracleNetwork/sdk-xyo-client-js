import { Query } from '../Query'

export type ModuleManifestQuerySchema = 'network.xyo.query.module.manifest'
export const ModuleManifestQuerySchema: ModuleManifestQuerySchema = 'network.xyo.query.module.manifest'

export type ModuleManifestQuery = Query<{
  schema: ModuleManifestQuerySchema
}>
