import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, Module, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { DivinerConfig } from './Config'
import { DivinerReportEndEventData, DivinerReportStartEventData } from './Events'

export interface Diviner {
  /* context is the hash of the payload that defines the divining */
  divine: (payloads?: XyoPayload[]) => Promisable<XyoPayloads>
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
