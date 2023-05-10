import { EventData } from '@xyo-network/module-events'
import { ModuleEventArgs } from '@xyo-network/module-model'

import { ArchivistModule } from '../Archivist'

export type ClearedEventArgs = ModuleEventArgs<ArchivistModule>

export interface ClearedEventData extends EventData {
  cleared: ClearedEventArgs
}
