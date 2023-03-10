import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, Module, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { DivinerConfig } from './Config'

export interface Diviner {
  /* context is the hash of the payload that defines the divining */
  divine: (payloads?: XyoPayload[]) => Promisable<XyoPayloads>
}

export type DivinerParams<
  TConfig extends AnyConfigSchema<DivinerConfig> = AnyConfigSchema<DivinerConfig>,
  TEventData extends ModuleEventData = ModuleEventData,
  TAdditional extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TEventData, TAdditional>

export type DivinerModule<TParams extends DivinerParams = DivinerParams> = Diviner & Module<TParams>
