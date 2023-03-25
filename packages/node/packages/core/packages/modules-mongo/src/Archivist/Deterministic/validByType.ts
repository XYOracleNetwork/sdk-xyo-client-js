import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { QueryBoundWitnessWrapper } from '@xyo-network/module'
import { QueryBoundWitnessSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const validByType = (results: [BoundWitnessWrapper[], PayloadWrapper[]] = [[], []], value?: Payload) => {
  const payload = PayloadWrapper.parse(value)
  if (payload.valid) {
    if (payload?.schema.startsWith(BoundWitnessSchema)) {
      const p = payload.payload
      if (payload.schema === QueryBoundWitnessSchema) {
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
