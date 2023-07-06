import { AnyObject } from '@xyo-network/core'
import { EventData } from '@xyo-network/module'
import { AnyConfigSchema, ModuleEventArgs, ModuleEventData, ModuleInstance, ModuleParams } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { DivinerConfig } from './Config'

export interface DivinerInstance {
  divine: (payloads?: Payload[]) => Promisable<Payload[]>
}

/** @deprecated use DivinerInstance instead */
export type Diviner = DivinerInstance

export type DivinerReportEndEventArgs = ModuleEventArgs<
  DivinerModule,
  {
    errors?: Error[]
    inPayloads?: Payload[]
    outPayloads: Payload[]
  }
>

export interface DivinerReportEndEventData extends EventData {
  reportEnd: DivinerReportEndEventArgs
}

export type DivinerReportStartEventArgs = ModuleEventArgs<
  DivinerModule,
  {
    inPayloads?: Payload[]
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
> = DivinerInstance & ModuleInstance<TParams, TEventData>
