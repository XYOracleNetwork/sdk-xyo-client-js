import { XyoArchivist } from '@xyo-network/archivist'
import { XyoPayload } from '@xyo-network/payload'

import { XyoHuriPayloadDivinerConfig } from '../Huri'

export type XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'
export const XyoArchivistPayloadDivinerConfigSchema: XyoArchivistPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.archivist.config'

export type XyoArchivistPayloadDivinerConfig<
  TTargetPayload extends XyoPayload = XyoPayload,
  T extends XyoPayload = XyoPayload,
> = XyoHuriPayloadDivinerConfig<
  TTargetPayload,
  {
    schema: XyoArchivistPayloadDivinerConfigSchema
    archivist: XyoArchivist
  } & T
>
