import { DivinerConfig } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

export type ArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'
export const ArchivistPayloadDivinerConfigSchema: ArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'

export type ArchivistPayloadDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    archivist?: string
    schema: ArchivistPayloadDivinerConfigSchema
  }
>
