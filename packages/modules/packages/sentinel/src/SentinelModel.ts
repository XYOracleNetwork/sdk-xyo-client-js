import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, Module, ModuleEventData, ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { SentinelConfig } from './Config'
import { SentinelReportEndEventData, SentinelReportStartEventData } from './Events'

export interface Sentinel {
  report: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
}

export interface SentinelModuleEventData extends SentinelReportEndEventData, SentinelReportStartEventData, ModuleEventData {}

export type SentinelParams<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
  TEventData extends SentinelModuleEventData = SentinelModuleEventData,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TEventData, TAdditionalParams>

export type SentinelModule<TParams extends SentinelParams = SentinelParams> = Module<TParams> & Sentinel
