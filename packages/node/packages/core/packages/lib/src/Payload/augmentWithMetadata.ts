import {
  BoundWitnessMeta,
  BoundWitnessWithMeta,
  BoundWitnessWithPartialMeta,
  PayloadMeta,
  PayloadWithMeta,
  PayloadWithPartialMeta,
} from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const augmentWithMetadata = <T extends PayloadWithPartialMeta[] | BoundWitnessWithPartialMeta[]>(
  payloads: T,
  meta: T extends PayloadWithPartialMeta[] ? PayloadMeta : BoundWitnessMeta,
): T extends PayloadWithPartialMeta ? PayloadWithMeta[] : BoundWitnessWithMeta[] => {
  return payloads.map((payload) => {
    const wrapper = new PayloadWrapper(payload)
    return {
      ...payload,
      ...meta,
      _hash: wrapper.hash,
    } as T extends PayloadWithPartialMeta ? PayloadWithMeta : BoundWitnessWithMeta
  })
}
