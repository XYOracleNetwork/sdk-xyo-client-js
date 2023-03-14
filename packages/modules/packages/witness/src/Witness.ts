import { AnyObject } from '@xyo-network/core'
import { EventData } from '@xyo-network/module'
import { AnyConfigSchema, Module, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'
import { WitnessReportEndEventData, WitnessReportStartEventData } from './Events'

export interface Witness {
  observe: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
}

export interface WitnessModuleEventData extends WitnessReportEndEventData, WitnessReportStartEventData {}

export type WitnessParams<
  TConfig extends AnyConfigSchema<XyoWitnessConfig> = AnyConfigSchema<XyoWitnessConfig>,
  TEventData extends ModuleEventData | undefined = undefined,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TEventData extends EventData ? WitnessModuleEventData | TEventData : WitnessModuleEventData, TAdditionalParams>

export type WitnessModule<TParams extends WitnessParams = WitnessParams> = Witness & Module<TParams>
