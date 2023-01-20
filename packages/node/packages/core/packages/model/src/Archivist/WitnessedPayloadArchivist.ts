import { Archivist } from '@xyo-network/archivist'
import { AbstractModule } from '@xyo-network/module'

import { XyoPayloadWithMeta } from '../Payload'

export type WitnessedPayloadArchivist = Archivist<XyoPayloadWithMeta> & AbstractModule
