import { EventData } from '@xyo-network/module-events'
import { ModuleEventArgs } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ArchivistModule } from '../Archivist'

export type InsertedEventArgs = ModuleEventArgs<
  ArchivistModule,
  {
    payloads: Payload[]
  }
>

export interface InsertedEventData extends EventData {
  inserted: InsertedEventArgs
}
