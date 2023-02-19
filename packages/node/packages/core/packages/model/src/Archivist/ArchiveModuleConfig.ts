import { ModuleConfig } from '@xyo-network/module'

export const ArchiveModuleConfigSchema = 'network.xyo.archivist.archive.config'
export type ArchiveModuleConfigSchema = 'network.xyo.archivist.archive.config'

export type ArchiveModuleConfig = ModuleConfig<{ archive: string; schema: ArchiveModuleConfigSchema }>
