import { Module } from '@xyo-network/module'
import { XyoPayloads } from '@xyo-network/payload'

export interface Diviner<TDivineResponse> extends Module {
  divine(payloads?: XyoPayloads): TDivineResponse
}
