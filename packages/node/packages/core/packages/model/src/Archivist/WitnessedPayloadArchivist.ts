import { Archivist } from '@xyo-network/archivist'
import { AbstractModule } from '@xyo-network/module'

import { PayloadWithMeta } from '../Payload'

export type WitnessedPayloadArchivist = Archivist<PayloadWithMeta> & AbstractModule
