import { IsModuleFactory } from '@xyo-network/module-model'

import { ArchivistModule } from './Archivist'
import { ArchivistGetQuerySchema } from './Queries'

export const isArchivistModule = IsModuleFactory.create<ArchivistModule>([ArchivistGetQuerySchema])
