import { Promisable } from '@xylabs/promise'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { Validator } from '@xyo-network/core'
import { DivinerModule } from '@xyo-network/diviner'
import { PayloadSetPayload } from '@xyo-network/payload-model'
import { WitnessModule } from '@xyo-network/witness-model'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PayloadSetPluginFunc = () => PayloadSetPlugin<any>

export type PayloadSetDivinerField<TDiviner extends DivinerModule = DivinerModule> = {
  diviner: (params?: TDiviner['params']) => Promisable<TDiviner>
  params?: TDiviner['params']
}

export type PayloadSetWitnessField<TWitness extends WitnessModule = WitnessModule> = {
  params?: TWitness['params']
  witness: (params?: TWitness['params']) => Promisable<TWitness>
}

export type PayloadSetPluginShared = {
  set: PayloadSetPayload
  validate?: (boundwitness: QueryBoundWitness) => Validator
  wrap?: (boundwitness: QueryBoundWitness) => QueryBoundWitnessWrapper
}

export type PayloadSetWitnessPlugin<TWitness extends WitnessModule = WitnessModule> = PayloadSetPluginShared & PayloadSetWitnessField<TWitness>

export type PayloadSetDivinerPlugin<TDiviner extends DivinerModule = DivinerModule> = PayloadSetPluginShared & PayloadSetDivinerField<TDiviner>

export type PayloadSetDualPlugin<
  TWitness extends WitnessModule = WitnessModule,
  TDiviner extends DivinerModule = DivinerModule,
> = PayloadSetWitnessPlugin<TWitness> & PayloadSetDivinerPlugin<TDiviner>

export type PayloadSetPlugin<TModule extends WitnessModule | DivinerModule = WitnessModule | DivinerModule> = TModule extends WitnessModule
  ? PayloadSetWitnessPlugin<TModule>
  : TModule extends DivinerModule
  ? PayloadSetDivinerPlugin<TModule>
  : never

export const isPayloadSetWitnessPlugin = (plugin: PayloadSetPlugin): plugin is PayloadSetWitnessPlugin => {
  return (plugin as PayloadSetWitnessPlugin)?.witness !== undefined
}

export const tryAsPayloadSetWitnessPlugin = (payloadSetPlugin: PayloadSetPlugin): PayloadSetWitnessPlugin | undefined => {
  return isPayloadSetWitnessPlugin(payloadSetPlugin) ? payloadSetPlugin : undefined
}

export const isPayloadSetDivinerPlugin = (plugin: PayloadSetPlugin): plugin is PayloadSetDivinerPlugin => {
  return (plugin as PayloadSetDivinerPlugin)?.diviner !== undefined
}

export const tryAsPayloadSetDivinerPlugin = (payloadSetPlugin: PayloadSetPlugin): PayloadSetDivinerPlugin | undefined => {
  return isPayloadSetDivinerPlugin(payloadSetPlugin) ? payloadSetPlugin : undefined
}
