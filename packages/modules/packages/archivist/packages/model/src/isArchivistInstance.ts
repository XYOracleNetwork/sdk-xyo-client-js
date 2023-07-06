import { IsInstanceFactory, isModuleInstance } from '@xyo-network/module-model'

import { ArchivistInstance } from './Archivist'

export const isArchivistInstance = IsInstanceFactory.create<ArchivistInstance>({ get: 'function' }, isModuleInstance)
