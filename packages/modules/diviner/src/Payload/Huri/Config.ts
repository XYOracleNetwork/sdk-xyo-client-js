import { HuriOptions } from '@xyo-network/payload'

import { XyoDivinerConfig } from '../../Config'

export type XyoHuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'
export const XyoHuriPayloadDivinerConfigSchema: XyoHuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'

export type XyoHuriPayloadDivinerConfig = XyoDivinerConfig<{
  schema: XyoHuriPayloadDivinerConfigSchema
  options?: HuriOptions
}>
