import { XyoPayloads } from '@xyo-network/payload'

export interface Diviner<TDivineResponse> {
  divine(payloads?: XyoPayloads): TDivineResponse
}
