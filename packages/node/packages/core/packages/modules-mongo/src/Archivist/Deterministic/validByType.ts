import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const validByType = (results: [BoundWitnessWrapper[], PayloadWrapper[]] = [[], []], value?: XyoPayload) => {
  const payload = PayloadWrapper.parse(value)
  if (payload.valid) {
    if (payload?.schema === XyoBoundWitnessSchema) {
      const bw = BoundWitnessWrapper.parse(payload)
      if (bw.valid) {
        results[0].push(bw)
      }
    } else {
      results[1].push(payload)
    }
  }
  return results
}
