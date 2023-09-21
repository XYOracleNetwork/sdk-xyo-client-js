import { PayloadWithMeta } from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const toPayloadWithMeta = async (wrapper: PayloadWrapper): Promise<PayloadWithMeta> => {
  return { ...wrapper.payload(), _hash: await wrapper.hashAsync(), _timestamp: Date.now() }
}
