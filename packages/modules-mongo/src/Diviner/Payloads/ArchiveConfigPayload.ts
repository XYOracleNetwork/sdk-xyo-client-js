import { DivinerConfig } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

export type ArchiveConfigPayload = DivinerConfig<Payload<{ archive?: string }>>
