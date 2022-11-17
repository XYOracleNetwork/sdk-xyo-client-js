import { Module } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

export interface Witness<TTarget extends XyoPayload = XyoPayload> extends Module {
  observe: (payloads?: TTarget[]) => Promisable<(TTarget | null)[]>
}
