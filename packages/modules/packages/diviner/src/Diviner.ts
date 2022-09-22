import { Module } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

export interface Diviner {
  divine(payloads?: XyoPayloads): Promisable<XyoPayload | null>
}

export interface DivinerModule extends Module, Diviner {}
