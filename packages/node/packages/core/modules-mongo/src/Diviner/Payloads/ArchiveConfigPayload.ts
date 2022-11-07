import { XyoDivinerConfig } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload'

export type ArchiveConfigPayload = XyoDivinerConfig<XyoPayload<{ archive?: string }>>
