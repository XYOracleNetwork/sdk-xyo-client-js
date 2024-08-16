import type { ModuleEventData } from '@xyo-network/module-model'

import type { ClearedEventData, DeletedEventData, InsertedEventData } from './EventModels/index.ts'

export interface ArchivistModuleEventData extends InsertedEventData, DeletedEventData, ClearedEventData, ModuleEventData {}
