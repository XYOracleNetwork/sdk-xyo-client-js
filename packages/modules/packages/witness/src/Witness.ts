import { AnyObject } from '@xyo-network/core'
import { EventData } from '@xyo-network/module'
import { AnyConfigSchema, Module, ModuleEventArgs, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'

export interface Witness {
  observe: (payloads?: Payload[]) => Promisable<Payload[]>
}

export type WitnessReportEndEventArgs = ModuleEventArgs<
  WitnessModule,
  {
    errors?: Error[]
    inPayloads?: Payload[]
    outPayloads?: Payload[]
  }
>

export interface WitnessReportEndEventData extends EventData {
  reportEnd: WitnessReportEndEventArgs
}

export type WitnessReportStartEventArgs = ModuleEventArgs<
  WitnessModule,
  {
    inPayloads?: Payload[]
  }
>

export interface WitnessReportStartEventData extends EventData {
  reportStart: WitnessReportStartEventArgs
}

export interface WitnessModuleEventData extends WitnessReportEndEventData, WitnessReportStartEventData, ModuleEventData {}

export type WitnessParams<
  TConfig extends AnyConfigSchema<XyoWitnessConfig> = AnyConfigSchema<XyoWitnessConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>

export type WitnessModule<
  TParams extends WitnessParams = WitnessParams,
  TEventData extends WitnessModuleEventData = WitnessModuleEventData,
> = Witness & Module<TParams, TEventData>
