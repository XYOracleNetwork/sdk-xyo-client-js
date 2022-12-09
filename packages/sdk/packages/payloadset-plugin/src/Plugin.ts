import { Validator } from '@xyo-network/core'
import { AbstractDiviner, DivinerConfig } from '@xyo-network/diviner'
import { QueryBoundWitnessWrapper, XyoModuleParams, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadSetPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { PayloadSetPluginParams } from './Configs'

export type PayloadSetPluginFunc = () => PayloadSetPlugin

export type PayloadSetDivinerField<TDivinerParams extends XyoModuleParams<DivinerConfig> = XyoModuleParams<DivinerConfig>> = {
  diviner: <TParams extends TDivinerParams>(params?: TParams) => Promisable<AbstractDiviner>
}

export type PayloadSetWitnessField<TWitnessParams extends XyoModuleParams<XyoWitnessConfig> = XyoModuleParams<XyoWitnessConfig>> = {
  witness: <TParams extends TWitnessParams>(params?: TParams) => Promisable<AbstractWitness>
}

export type PayloadSetPluginShared<TParams extends XyoModuleParams = XyoModuleParams> = {
  params?: PayloadSetPluginParams<TParams>
  set: PayloadSetPayload
  validate?: (boundwitness: XyoQueryBoundWitness) => Validator
  wrap?: (boundwitness: XyoQueryBoundWitness) => QueryBoundWitnessWrapper
}

export type PayloadSetWitnessPlugin<TWitnessParams extends XyoModuleParams<XyoWitnessConfig> = XyoModuleParams<XyoWitnessConfig>> =
  PayloadSetPluginShared<TWitnessParams> & PayloadSetWitnessField<TWitnessParams>

export type PayloadSetDivinerPlugin<TDivinerParams extends XyoModuleParams<DivinerConfig> = XyoModuleParams<DivinerConfig>> =
  PayloadSetPluginShared<TDivinerParams> & PayloadSetDivinerField<TDivinerParams>

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
