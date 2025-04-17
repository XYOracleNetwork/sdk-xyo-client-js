import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitness, isQueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const validByType = async (payloads: WithStorageMeta<Payload>[] = []) => {
  const results: [WithStorageMeta<BoundWitness>[], WithStorageMeta<Payload>[]] = [[], []]
  await Promise.all(
    payloads.map(async (payload) => {
      if (isBoundWitness(payload)) {
        const wrapper = isQueryBoundWitness(payload) ? QueryBoundWitnessWrapper : BoundWitnessWrapper
        const bw = wrapper.parse(payload)
        if (await bw.getValid()) {
          results[0].push(payload)
        } else {
          const errors = await bw.getErrors()
          console.log(`validByType.Error: ${JSON.stringify(errors, null, 2)}`)
        }
      } else {
        const payloadWrapper = PayloadWrapper.wrap(payload)
        if (await payloadWrapper.getValid()) {
          results[1].push(payload)
        }
      }
    }),
  )
  return results
}
