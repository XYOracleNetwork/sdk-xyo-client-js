import { XyoArchivist } from '@xyo-network/archivist'

import { XyoHuriPayloadDivinerConfig } from '../Huri'

export type XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'
export const XyoArchivistPayloadDivinerConfigSchema: XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'

export type XyoArchivistPayloadDivinerConfig = XyoHuriPayloadDivinerConfig<{
  schema: XyoArchivistPayloadDivinerConfigSchema
  archivist: XyoArchivist
}>
