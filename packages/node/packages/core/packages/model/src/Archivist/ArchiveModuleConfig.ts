import { ArchivistConfig } from '@xyo-network/archivist'

export const ArchiveModuleConfigSchema = 'network.xyo.archivist.archive.config'
export type ArchiveModuleConfigSchema = 'network.xyo.archivist.archive.config'

export type ArchiveModuleConfig = ArchivistConfig<{
  archive?: string
  schema: ArchiveModuleConfigSchema
}>
