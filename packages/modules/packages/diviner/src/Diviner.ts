import { XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

export interface Diviner<TDivineResponse> {
  divine(payloads?: XyoPayloads): Promisable<TDivineResponse>
}
