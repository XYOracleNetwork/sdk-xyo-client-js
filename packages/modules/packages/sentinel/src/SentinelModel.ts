import { Module } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { SentinelConfig } from './Config'

export interface Sentinel {
  report: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
}

export type SentinelModule<TConfig extends SentinelConfig = SentinelConfig> = Module<TConfig> & Sentinel
