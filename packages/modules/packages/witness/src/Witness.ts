import { AnyObject } from '@xyo-network/core'
import { Module, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'

export interface Witness {
  observe: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
}

export type WitnessParams<
  TConfig extends XyoWitnessConfig = XyoWitnessConfig,
  TEventData extends ModuleEventData = ModuleEventData,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TEventData, TAdditionalParams>

export type WitnessModule<TParams extends WitnessParams = WitnessParams> = Witness & Module<TParams>
