import {
  XyoBoundWitnessMeta,
  XyoBoundWitnessWithMeta,
  XyoBoundWitnessWithPartialMeta,
  XyoPayloadMeta,
  XyoPayloadWithMeta,
  XyoPayloadWithPartialMeta,
} from '@xyo-network/node-core-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const augmentWithMetadata = <T extends XyoPayloadWithPartialMeta[] | XyoBoundWitnessWithPartialMeta[]>(
  payloads: T,
  meta: T extends XyoPayloadWithPartialMeta[] ? XyoPayloadMeta : XyoBoundWitnessMeta,
): T extends XyoPayloadWithPartialMeta ? XyoPayloadWithMeta[] : XyoBoundWitnessWithMeta[] => {
  return payloads.map((payload) => {
    const wrapper = new PayloadWrapper(payload)
    return {
      ...payload,
      ...meta,
      _hash: wrapper.hash,
    } as T extends XyoPayloadWithPartialMeta ? XyoPayloadWithMeta : XyoBoundWitnessWithMeta
  })
}
