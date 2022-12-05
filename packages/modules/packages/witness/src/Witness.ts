import { Module } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

export interface Witness extends Module {
  observe: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
}
