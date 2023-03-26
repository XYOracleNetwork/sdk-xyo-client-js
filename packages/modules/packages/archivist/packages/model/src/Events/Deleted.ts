import { EventData, ModuleEventArgs } from '@xyo-network/module'

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
