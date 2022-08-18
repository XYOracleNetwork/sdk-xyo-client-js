import { XyoArchivist } from '@xyo-network/archivist'

import { XyoDivinerConfig } from '../../Config'

export type XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'
export const XyoArchivistPayloadDivinerConfigSchema: XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'

export type XyoArchivistPayloadDivinerConfig = XyoDivinerConfig<{
  schema: XyoArchivistPayloadDivinerConfigSchema
  archivist: XyoArchivist
}>
