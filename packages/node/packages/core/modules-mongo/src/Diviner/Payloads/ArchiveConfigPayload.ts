import { DivinerConfig } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload'

export type ArchiveConfigPayload = DivinerConfig<XyoPayload<{ archive?: string }>>
