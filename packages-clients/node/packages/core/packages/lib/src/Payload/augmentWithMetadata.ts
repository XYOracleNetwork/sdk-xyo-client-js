import type {
  BoundWitnessMeta,
  BoundWitnessWithMeta,
  BoundWitnessWithPartialMeta,
  PayloadMeta,
  PayloadWithMeta,
  PayloadWithPartialMeta,
} from '@xyo-network/payload-mongodb'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const augmentWithMetadata = async <T extends PayloadWithPartialMeta[] | BoundWitnessWithPartialMeta[]>(
  payloads: T,
  meta: T extends PayloadWithPartialMeta[] ? PayloadMeta : BoundWitnessMeta,
): Promise<T extends PayloadWithPartialMeta ? PayloadWithMeta[] : BoundWitnessWithMeta[]> => {
  return await Promise.all(
    payloads.map(async (payload) => {
      const wrapper = PayloadWrapper.wrap(payload)
      return {
        ...payload,
        ...meta,
        _hash: await wrapper.hashAsync(),
      } as T extends PayloadWithPartialMeta ? PayloadWithMeta : BoundWitnessWithMeta
    }),
  )
}
