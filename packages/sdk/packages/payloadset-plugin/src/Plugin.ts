import { Validator } from '@xyo-network/core'
import { DivinerConfig, DivinerModule } from '@xyo-network/diviner'
import { ModuleParams, QueryBoundWitnessWrapper, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadSetPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { WitnessModule, XyoWitnessConfig } from '@xyo-network/witness'

import { PayloadSetPluginParams } from './Configs'

export type PayloadSetPluginFunc = () => PayloadSetPlugin

export type PayloadSetDivinerField<
  TDiviner extends DivinerModule = DivinerModule,
  TDivinerParams extends ModuleParams<DivinerConfig> = ModuleParams<DivinerConfig>,
> = {
  diviner: <TParams extends TDivinerParams>(params?: TParams) => Promisable<TDiviner>
}

export type PayloadSetWitnessField<
  TWitness extends WitnessModule = WitnessModule,
  TWitnessParams extends ModuleParams<XyoWitnessConfig> = ModuleParams<XyoWitnessConfig>,
> = {
  witness: <TParams extends TWitnessParams>(params?: TParams) => Promisable<TWitness>
}

export type PayloadSetPluginShared<TParams extends ModuleParams = ModuleParams> = {
  params?: PayloadSetPluginParams<TParams>
  set: PayloadSetPayload
  validate?: (boundwitness: XyoQueryBoundWitness) => Validator
  wrap?: (boundwitness: XyoQueryBoundWitness) => QueryBoundWitnessWrapper
}

export type PayloadSetWitnessPlugin<
  TWitness extends WitnessModule = WitnessModule,
  TWitnessParams extends ModuleParams<XyoWitnessConfig> = ModuleParams<XyoWitnessConfig>,
> = PayloadSetPluginShared<TWitnessParams> & PayloadSetWitnessField<TWitness, TWitnessParams>

export type PayloadSetDivinerPlugin<
  TDiviner extends DivinerModule = DivinerModule,
  TDivinerParams extends ModuleParams<DivinerConfig> = ModuleParams<DivinerConfig>,
> = PayloadSetPluginShared<TDivinerParams> & PayloadSetDivinerField<TDiviner, TDivinerParams>

export type PayloadSetPlugin = PayloadSetWitnessPlugin | PayloadSetDivinerPlugin

export const isPayloadSetWitnessPlugin = <T extends PayloadSetWitnessPlugin>(payloadSetPlugin: PayloadSetPlugin) => {
  return ((payloadSetPlugin: PayloadSetPlugin): payloadSetPlugin is T => (payloadSetPlugin as PayloadSetWitnessPlugin)?.witness !== undefined)(
    payloadSetPlugin,
  )
    ? payloadSetPlugin
    : undefined
}

export const isPayloadSetDivinerPlugin = <T extends PayloadSetDivinerPlugin>(payloadSetPlugin: PayloadSetPlugin) => {
  return ((payloadSetPlugin: PayloadSetPlugin): payloadSetPlugin is T => (payloadSetPlugin as PayloadSetDivinerPlugin)?.diviner !== undefined)(
    payloadSetPlugin,
  )
    ? payloadSetPlugin
    : undefined
}
