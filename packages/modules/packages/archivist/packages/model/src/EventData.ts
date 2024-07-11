import { ModuleEventData } from '@xyo-network/module-model'

import { ClearedEventData, DeletedEventData, InsertedEventData } from './EventModels/index.js'

export interface ArchivistModuleEventData extends InsertedEventData, DeletedEventData, ClearedEventData, ModuleEventData {}
