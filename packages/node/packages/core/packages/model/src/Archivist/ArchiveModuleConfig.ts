import { AbstractModuleConfig } from '@xyo-network/module'

export const ArchiveModuleConfigSchema = 'network.xyo.archivist.archive.config'
export type ArchiveModuleConfigSchema = 'network.xyo.archivist.archive.config'

export type ArchiveModuleConfig = AbstractModuleConfig<{ archive: string; schema: ArchiveModuleConfigSchema }>
