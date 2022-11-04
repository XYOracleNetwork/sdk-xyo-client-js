import { Archivist } from '@xyo-network/archivist'
import { XyoModule } from '@xyo-network/module'

import { XyoPayloadWithMeta } from '../Payload'

export type WitnessedPayloadArchivist = Archivist<XyoPayloadWithMeta> & XyoModule
