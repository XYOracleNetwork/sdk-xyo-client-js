import { Module } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export interface Witness {
  observe: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
}

export type WitnessModule = Witness & Module
