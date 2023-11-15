import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessWithPartialMeta } from './BoundWitnessWithMeta'

export type BoundWitnessMapResult = [Array<BoundWitness>, Array<Payload>]

export const flatMapBoundWitness = (boundWitness: BoundWitnessWithPartialMeta): BoundWitnessMapResult => {
  const all = flatten(boundWitness)
  const boundWitnesses: BoundWitness[] = all.filter((x) => x.schema === BoundWitnessSchema) as BoundWitness[]
  const payloads: Payload[] = all.filter((x) => x.schema !== BoundWitnessSchema)
  return [boundWitnesses, payloads]
}

const flatten = (boundWitness: BoundWitnessWithPartialMeta): Payload[] => {
  const payloads: Payload[] =
    boundWitness?._payloads
      ?.map((payload) => {
        return payload.schema === BoundWitnessSchema ? flatten(payload as BoundWitnessWithPartialMeta) : payload
      })
      .flat() || []
  return ([boundWitness] as Payload[]).concat(payloads)
}
