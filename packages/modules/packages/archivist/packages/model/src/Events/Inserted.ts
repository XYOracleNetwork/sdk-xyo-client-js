import { BoundWitness } from '@xyo-network/boundwitness-model'
import { EventData, ModuleEventArgs } from '@xyo-network/module'

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
