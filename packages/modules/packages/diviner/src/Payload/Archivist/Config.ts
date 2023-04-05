import { DivinerConfig } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

export type XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'
export const XyoArchivistPayloadDivinerConfigSchema: XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'

export type XyoArchivistPayloadDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    archivist?: string
    schema: XyoArchivistPayloadDivinerConfigSchema
  }
>
