import { AnyObject } from '@xyo-network/core'
import { EventData, Module, ModuleParams } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'

export interface Witness {
  observe: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
}

export type WitnessParams<
  TConfig extends XyoWitnessConfig = XyoWitnessConfig,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>

export type WitnessModule<TParams extends WitnessParams = WitnessParams, TEventData extends EventData | undefined = undefined> = Witness &
  Module<TParams, TEventData>
