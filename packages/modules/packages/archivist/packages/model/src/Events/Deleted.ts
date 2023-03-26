import { EventData } from '@xyo-network/module-events'
import { ModuleEventArgs } from '@xyo-network/module-model'

import { ArchivistModule } from '../Archivist'

export type DeletedEventArgs = ModuleEventArgs<
  ArchivistModule,
  {
    found: boolean[]
    hashes: string[]
  }
>

export interface DeletedEventData extends EventData {
  deleted: DeletedEventArgs
}
