import { isModule, IsModuleFactory } from '@xyo-network/module-model'

import { ArchivistModule } from './Archivist'

export const isArchivistModule = IsModuleFactory.create<ArchivistModule>(isModule, ['get'])
