import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { QueryBoundWitnessWrapper } from '@xyo-network/module'
import { isQueryBoundWitness } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const validByType = (results: [BoundWitnessWrapper[], PayloadWrapper[]] = [[], []], value?: Payload) => {
  const payload = PayloadWrapper.parse(value)
  if (payload.valid) {
    const p = payload.payload
    if (isBoundWitness(p)) {
      // const wrapper = isQueryBoundWitness(p) ? QueryBoundWitnessWrapper : BoundWitnessWrapper
      if (isQueryBoundWitness(p)) {
        // TODO: Validate errors
        const bw = QueryBoundWitnessWrapper.parse(p)
        results[0].push(bw)
      } else {
        const bw = BoundWitnessWrapper.parse(p)
        if (bw.valid) {
          results[0].push(bw)
        }
      }
    } else {
      results[1].push(payload)
    }
  }
  return results
}
