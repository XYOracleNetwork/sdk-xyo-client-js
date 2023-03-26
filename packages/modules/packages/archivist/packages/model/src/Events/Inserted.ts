import { BoundWitness } from '@xyo-network/boundwitness-model'
import { EventData } from '@xyo-network/module-events'
import { ModuleEventArgs } from '@xyo-network/module-model'

import { ArchivistModule } from '../Archivist'

export type InsertedEventArgs = ModuleEventArgs<
  ArchivistModule,
  {
    boundWitnesses: BoundWitness[]
  }
>

export interface InsertedEventData extends EventData {
  inserted: InsertedEventArgs
}
