import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema, type Payload } from '@xyo-network/payload-model'

export const ArchivistPayloadDivinerConfigSchema = asSchema('network.xyo.diviner.payload.archivist.config', true)
export type ArchivistPayloadDivinerConfigSchema = typeof ArchivistPayloadDivinerConfigSchema

export type ArchivistPayloadDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    archivist?: string
    schema: ArchivistPayloadDivinerConfigSchema
  }
>
