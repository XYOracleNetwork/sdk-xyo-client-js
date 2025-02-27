import type { DivinerConfig } from '@xyo-network/diviner-model'
import type { Payload } from '@xyo-network/payload-model'

export const ArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config' as const
export type ArchivistPayloadDivinerConfigSchema = typeof ArchivistPayloadDivinerConfigSchema

export type ArchivistPayloadDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    archivist?: string
    schema: ArchivistPayloadDivinerConfigSchema
  }
>
