import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, EventData, Module, ModuleEventArgs, ModuleEventData, ModuleParams } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { SentinelConfig } from './Config'

export interface Sentinel {
  report: (payloads?: Payload[]) => Promisable<Payload[]>
}

export type SentinelReportEndEventArgs = ModuleEventArgs<
  SentinelModule,
  {
    boundWitness?: BoundWitness
    errors?: Error[]
    inPayloads?: Payload[]
    outPayloads: Payload[]
  }
>

export interface SentinelReportEndEventData extends EventData {
  reportEnd: SentinelReportEndEventArgs
}

export type SentinelReportStartEventArgs = ModuleEventArgs<
  SentinelModule,
  {
    inPayloads?: Payload[]
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
