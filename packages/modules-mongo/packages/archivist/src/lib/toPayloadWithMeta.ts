import { PayloadWithMeta } from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const toPayloadWithMeta = async (wrapper: PayloadWrapper): Promise<PayloadWithMeta> => {
  return { ...wrapper.jsonPayload(), _hash: await wrapper.hashAsync(), _timestamp: Date.now() }
}
