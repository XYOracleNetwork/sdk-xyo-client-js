import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { QueryBoundWitnessWrapper } from '@xyo-network/module'
import { isQueryBoundWitness } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const validByType = async (payloads: Payload[] = []) => {
  const results: [BoundWitnessWrapper[], PayloadWrapper[]] = [[], []]
  await Promise.all(
    payloads.map(async (payload) => {
      if (isBoundWitness(payload)) {
        const wrapper = (
          isQueryBoundWitness(payload) ? QueryBoundWitnessWrapper.parse(payload) : BoundWitnessWrapper.parse(payload)
        ) as BoundWitnessWrapper
        if (await wrapper.getValid()) {
          results[0].push(wrapper)
        }
      } else {
        const payloadWrapper = PayloadWrapper.parse(payload)
        if (await payloadWrapper.getValid()) {
          results[1].push(payloadWrapper)
        }
      }
    }),
  )
  return results
}
