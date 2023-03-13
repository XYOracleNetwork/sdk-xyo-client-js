import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, EventData, Module, ModuleParams } from '@xyo-network/module-model'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { DivinerConfig } from './Config'
import { DivinerReportEndEventData, DivinerReportStartEventData } from './Events'

export interface Diviner {
  /* context is the hash of the payload that defines the divining */
  divine: (payloads?: XyoPayload[]) => Promisable<XyoPayloads>
}

export interface DivinerModuleEventData extends DivinerReportEndEventData, DivinerReportStartEventData {}

export type DivinerParams<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
  TEventData extends EventData | undefined = undefined,
  TAdditional extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TEventData extends EventData ? DivinerModuleEventData | TEventData : DivinerModuleEventData, TAdditional>

export type DivinerModule<TParams extends DivinerParams = DivinerParams> = Diviner & Module<TParams>
