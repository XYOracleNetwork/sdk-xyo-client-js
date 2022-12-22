import { Module } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

export interface Bridge {
  connect: () => Promisable<boolean>
  disconnect: () => Promisable<boolean>
}

export interface BridgeModule extends Bridge, Module {}
