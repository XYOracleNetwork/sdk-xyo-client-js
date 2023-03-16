import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, Module, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'
import { WitnessReportEndEventData, WitnessReportStartEventData } from './Events'

export interface Witness {
  observe: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
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
