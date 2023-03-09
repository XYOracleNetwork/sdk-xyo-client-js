import { AnyConfigSchema, Module, ModuleParams } from '@xyo-network/module-model'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { DivinerConfig } from './Config'

export interface Diviner {
  /* context is the hash of the payload that defines the divining */
  divine: (payloads?: XyoPayload[]) => Promisable<XyoPayloads>
}

export type DivinerParams<TConfig extends AnyConfigSchema<DivinerConfig> = DivinerConfig> = ModuleParams<TConfig>

export interface DivinerModule<TParams extends DivinerParams<AnyConfigSchema<DivinerConfig>> = DivinerParams> extends Module<TParams>, Diviner {}
