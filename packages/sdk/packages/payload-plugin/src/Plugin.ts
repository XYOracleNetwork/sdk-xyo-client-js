import { Validator } from '@xyo-network/core'
import { AbstractDiviner, DivinerConfig } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoPayloadPluginParams } from './XyoPayloadPluginConfigs'

export type XyoPayloadPluginFunc<
  TPayload extends XyoPayload = XyoPayload,
  TWitnessParams extends XyoModuleParams<XyoWitnessConfig> = XyoModuleParams<XyoWitnessConfig>,
  TDivinerParams extends XyoModuleParams<DivinerConfig> = XyoModuleParams<DivinerConfig>,
> = () => XyoPayloadPlugin<TPayload, TWitnessParams, TDivinerParams>

export type XyoPayloadPlugin<
  TPayload extends XyoPayload = XyoPayload,
  TWitnessParams extends XyoModuleParams<XyoWitnessConfig> = XyoModuleParams<XyoWitnessConfig>,
  TDivinerParams extends XyoModuleParams<DivinerConfig> = XyoModuleParams<DivinerConfig>,
> = {
  auto?: boolean
  diviner?: <TParams extends TDivinerParams>(params?: TParams) => Promisable<AbstractDiviner>
  params?: XyoPayloadPluginParams<TWitnessParams, TDivinerParams>
  schema: TPayload['schema']
  template?: () => Partial<TPayload>
  validate?: (payload: XyoPayload) => Validator
  witness?: <TParams extends TWitnessParams>(params?: TParams) => Promisable<AbstractWitness>
  wrap?: (payload: XyoPayload) => PayloadWrapper
}

/* Note: We use PartialWitnessConfig to allow people to config witnesses without having to pass in all the schema info*/
