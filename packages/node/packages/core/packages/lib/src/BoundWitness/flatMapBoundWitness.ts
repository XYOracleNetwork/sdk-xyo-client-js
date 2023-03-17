import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { XyoBoundWitnessWithPartialMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'

export type BoundWitnessMapResult = [Array<XyoBoundWitness>, Array<Payload>]

export const flatMapBoundWitness = (boundWitness: XyoBoundWitnessWithPartialMeta): BoundWitnessMapResult => {
  const all = flatten(boundWitness)
  const boundWitnesses: XyoBoundWitness[] = all.filter((x) => x.schema === XyoBoundWitnessSchema) as XyoBoundWitness[]
  const payloads: Payload[] = all.filter((x) => x.schema !== XyoBoundWitnessSchema)
  return [boundWitnesses, payloads]
}

const flatten = (boundWitness: XyoBoundWitnessWithPartialMeta): Payload[] => {
  const payloads: Payload[] =
    boundWitness?._payloads
      ?.map((payload) => {
        return payload.schema === XyoBoundWitnessSchema ? flatten(payload as XyoBoundWitnessWithPartialMeta) : payload
      })
      .flat() || []
  return ([boundWitness] as Payload[]).concat(payloads)
}
