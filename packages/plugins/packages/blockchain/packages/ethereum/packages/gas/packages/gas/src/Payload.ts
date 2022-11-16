import { XyoPayload } from '@xyo-network/payload'

import { AssetInfo, Token } from './Model'
import { XyoEthereumGasSchema } from './Schema'

export interface XyoEthereumGasPayload extends XyoPayload {
  assets: Partial<Record<Token, AssetInfo | undefined>>
  schema: XyoEthereumGasSchema
  timestamp: number
}
