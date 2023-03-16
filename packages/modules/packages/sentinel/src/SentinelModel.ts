import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, EventData, Module, ModuleEventArgs, ModuleEventData, ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { SentinelConfig } from './Config'

export interface Sentinel {
  report: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
}

export type SentinelReportEndEventArgs = ModuleEventArgs<
  SentinelModule,
  {
    boundWitness?: XyoBoundWitness
    errors?: Error[]
    inPayloads?: XyoPayload[]
    outPayloads: XyoPayload[]
  }
>

export interface SentinelReportEndEventData extends EventData {
  reportEnd: SentinelReportEndEventArgs
}

export type SentinelReportStartEventArgs = ModuleEventArgs<
  SentinelModule,
  {
    inPayloads?: XyoPayload[]
  }
>

export interface SentinelReportStartEventData extends EventData {
  reportStart: SentinelReportStartEventArgs
}

export interface SentinelModuleEventData extends SentinelReportEndEventData, SentinelReportStartEventData, ModuleEventData {}

export type SentinelParams<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>

export type SentinelModule<
  TParams extends SentinelParams = SentinelParams,
  TEventData extends SentinelModuleEventData = SentinelModuleEventData,
> = Module<TParams, TEventData> & Sentinel
