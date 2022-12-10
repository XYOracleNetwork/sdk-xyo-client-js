import { PayloadSetPayload } from '@xyo-network/payload'

import { PayloadSetPlugin } from './Plugin'

export const createPayloadSetPlugin = <T extends PayloadSetPlugin = PayloadSetPlugin>(set: PayloadSetPayload, plugin: Omit<T, 'set'>): T => {
  return {
    ...plugin,
    set,
  } as T
}
