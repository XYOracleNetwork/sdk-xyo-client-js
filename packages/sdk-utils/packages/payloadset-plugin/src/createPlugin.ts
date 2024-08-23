import type { DivinerModule } from '@xyo-network/diviner-model'
import type { PayloadSetPayload } from '@xyo-network/payload-model'
import type { WitnessModule } from '@xyo-network/witness-model'

import type {
  PayloadSetDivinerPlugin, PayloadSetDualPlugin, PayloadSetWitnessPlugin,
} from './Plugin.ts'

export const createPayloadSetDualPlugin = <TWitness extends WitnessModule = WitnessModule, TDiviner extends DivinerModule = DivinerModule>(
  set: PayloadSetPayload,
  plugin: Omit<PayloadSetDualPlugin<TWitness, TDiviner>, 'set'>,
): PayloadSetDualPlugin<TWitness, TDiviner> => {
  return {
    ...plugin,
    set,
  }
}

export const createPayloadSetWitnessPlugin = <TModule extends WitnessModule = WitnessModule>(
  set: PayloadSetPayload,
  plugin: Omit<PayloadSetWitnessPlugin<TModule>, 'set'>,
): PayloadSetWitnessPlugin<TModule> => {
  return {
    ...plugin,
    set,
  }
}

export const createPayloadSetDivinerPlugin = <TModule extends DivinerModule = DivinerModule>(
  set: PayloadSetPayload,
  plugin: Omit<PayloadSetDivinerPlugin<TModule>, 'set'>,
): PayloadSetDivinerPlugin<TModule> => {
  return {
    ...plugin,
    set,
  }
}
