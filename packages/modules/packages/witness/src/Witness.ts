import { EventData, Module } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'

export interface Witness {
  observe: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
}

export type WitnessModule<TConfig extends XyoWitnessConfig = XyoWitnessConfig, TEventData extends EventData | undefined = undefined> = Witness &
  Module<TConfig, TEventData>
