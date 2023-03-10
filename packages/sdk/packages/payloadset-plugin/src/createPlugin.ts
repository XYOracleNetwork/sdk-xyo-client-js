import { PayloadSetPayload } from '@xyo-network/payload-model'

import { PayloadSetDivinerPlugin, PayloadSetPlugin, PayloadSetWitnessPlugin } from './Plugin'

export const createPayloadSetPlugin = <T extends PayloadSetPlugin = PayloadSetPlugin>(set: PayloadSetPayload, plugin: Omit<T, 'set'>): T => {
  return {
    ...plugin,
    set,
  } as T
}

export const createPayloadSetWitnessPlugin = <T extends PayloadSetWitnessPlugin = PayloadSetWitnessPlugin>(
  set: PayloadSetPayload,
  plugin: Omit<T, 'set'>,
): T => {
  return {
    ...plugin,
    set,
  } as T
}

export const createPayloadSetDivinerPlugin = <T extends PayloadSetDivinerPlugin = PayloadSetDivinerPlugin>(
  set: PayloadSetPayload,
  plugin: Omit<T, 'set'>,
): T => {
  return {
    ...plugin,
    set,
  } as T
}
