import { AnyObject } from '@xyo-network/core'
import { EventData } from '@xyo-network/module'
import { AnyConfigSchema, Module, ModuleEventArgs, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { DivinerConfig } from './Config'

export interface Diviner {
  /* context is the hash of the payload that defines the divining */
  divine: (payloads?: XyoPayload[]) => Promisable<XyoPayloads>
}

export type DivinerReportEndEventArgs = ModuleEventArgs<
  DivinerModule,
  {
    errors?: Error[]
    inPayloads?: XyoPayload[]
    outPayloads: XyoPayload[]
  }
>

export interface DivinerReportEndEventData extends EventData {
  reportEnd: DivinerReportEndEventArgs
}

export type DivinerReportStartEventArgs = ModuleEventArgs<
  DivinerModule,
  {
    inPayloads?: XyoPayload[]
  }
>

export interface DivinerReportStartEventData extends EventData {
  reportStart: DivinerReportStartEventArgs
}

export interface DivinerModuleEventData extends DivinerReportEndEventData, DivinerReportStartEventData, ModuleEventData {}

export type DivinerParams<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
  TAdditional extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditional>

export type DivinerModule<
  TParams extends DivinerParams = DivinerParams,
  TEventData extends DivinerModuleEventData = DivinerModuleEventData,
> = Diviner & Module<TParams, TEventData>
