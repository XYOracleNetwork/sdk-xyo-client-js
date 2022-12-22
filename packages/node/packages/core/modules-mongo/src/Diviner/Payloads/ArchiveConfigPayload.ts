import { DivinerConfig } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload-model'

export type ArchiveConfigPayload = DivinerConfig<XyoPayload<{ archive?: string }>>
