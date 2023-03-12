import { DivinerModule } from '@xyo-network/diviner-model'
import { PayloadSetPayload } from '@xyo-network/payload-model'
import { WitnessModule } from '@xyo-network/witness'

import { PayloadSetDivinerPlugin, PayloadSetWitnessPlugin } from './Plugin'

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
