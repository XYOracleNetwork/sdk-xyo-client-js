import { XyoValidator } from '@xyo-network/core'
import { XyoDiviner, XyoDivinerConfig, XyoDivinerParams } from '@xyo-network/diviner'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'
import { XyoWitness, XyoWitnessConfig, XyoWitnessParams } from '@xyo-network/witness'

import { XyoPayloadPluginParams } from './XyoPayloadPluginConfigs'

export type XyoPayloadPluginFunc<
  TPayload extends XyoPayload = XyoPayload,
  TWitnessConfig extends XyoWitnessConfig<TPayload> = XyoWitnessConfig<TPayload>,
  TDivinerConfig extends XyoDivinerConfig<TPayload> = XyoDivinerConfig<TPayload>,
> = () => XyoPayloadPlugin<TPayload, TWitnessConfig, TDivinerConfig>

export type XyoPayloadPlugin<
  TPayload extends XyoPayload = XyoPayload,
  TWitnessConfig extends XyoWitnessConfig<TPayload> = XyoWitnessConfig<TPayload>,
  TDivinerConfig extends XyoDivinerConfig = XyoDivinerConfig,
> = {
  params?: XyoPayloadPluginParams<TWitnessConfig, TDivinerConfig>
  schema: TPayload['schema']
  auto?: boolean
  template?: () => Partial<TPayload>
  validate?: (payload: XyoPayload) => XyoValidator
  wrap?: (payload: XyoPayload) => PayloadWrapper
  witness?: <TParams extends XyoWitnessParams & { config?: TWitnessConfig }>(params?: TParams) => Promisable<XyoWitness>
  diviner?: <TParams extends XyoDivinerParams & { config?: TDivinerConfig }>(params?: TParams) => Promisable<XyoDiviner>
}

/* Note: We use PartialWitnessConfig to allow people to config witnesses without having to pass in all the schema info*/
