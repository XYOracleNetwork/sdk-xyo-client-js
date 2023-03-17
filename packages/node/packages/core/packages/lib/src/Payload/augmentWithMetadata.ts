import {
  PayloadMeta,
  PayloadWithMeta,
  PayloadWithPartialMeta,
  XyoBoundWitnessMeta,
  XyoBoundWitnessWithMeta,
  XyoBoundWitnessWithPartialMeta,
} from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const augmentWithMetadata = <T extends PayloadWithPartialMeta[] | XyoBoundWitnessWithPartialMeta[]>(
  payloads: T,
  meta: T extends PayloadWithPartialMeta[] ? PayloadMeta : XyoBoundWitnessMeta,
): T extends PayloadWithPartialMeta ? PayloadWithMeta[] : XyoBoundWitnessWithMeta[] => {
  return payloads.map((payload) => {
    const wrapper = new PayloadWrapper(payload)
    return {
      ...payload,
      ...meta,
      _hash: wrapper.hash,
    } as T extends PayloadWithPartialMeta ? PayloadWithMeta : XyoBoundWitnessWithMeta
  })
}
