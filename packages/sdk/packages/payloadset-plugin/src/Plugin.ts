import { Validator } from '@xyo-network/core'
import { DivinerModule } from '@xyo-network/diviner'
import { QueryBoundWitnessWrapper, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadSetPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { WitnessModule } from '@xyo-network/witness'

export type PayloadSetPluginFunc = () => PayloadSetPlugin

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
  validate?: (boundwitness: XyoQueryBoundWitness) => Validator
  wrap?: (boundwitness: XyoQueryBoundWitness) => QueryBoundWitnessWrapper
}

export type PayloadSetWitnessPlugin<TWitness extends WitnessModule = WitnessModule> = PayloadSetPluginShared & PayloadSetWitnessField<TWitness>

export type PayloadSetDivinerPlugin<TDiviner extends DivinerModule = DivinerModule> = PayloadSetPluginShared & PayloadSetDivinerField<TDiviner>

export type PayloadSetPlugin<TModule extends WitnessModule | DivinerModule = WitnessModule | DivinerModule> = TModule extends WitnessModule
  ? PayloadSetWitnessPlugin<TModule>
  : TModule extends DivinerModule
  ? PayloadSetDivinerPlugin<TModule>
  : never

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
