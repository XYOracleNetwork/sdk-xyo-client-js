import { DivinerConfig } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

export type XyoArchivistBoundWitnessDivinerConfigSchema = 'network.xyo.diviner.boundwitness.config'
export const XyoArchivistBoundWitnessDivinerConfigSchema: XyoArchivistBoundWitnessDivinerConfigSchema = 'network.xyo.diviner.boundwitness.config'

export type XyoArchivistBoundWitnessDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    archivist?: string
    schema: XyoArchivistBoundWitnessDivinerConfigSchema
  }
>
