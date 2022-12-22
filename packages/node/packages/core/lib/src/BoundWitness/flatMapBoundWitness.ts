import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { XyoBoundWitnessWithPartialMeta } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload-model'

export type BoundWitnessMapResult = [Array<XyoBoundWitness>, Array<XyoPayload>]

export const flatMapBoundWitness = (boundWitness: XyoBoundWitnessWithPartialMeta): BoundWitnessMapResult => {
  const all = flatten(boundWitness)
  const boundWitnesses: XyoBoundWitness[] = all.filter((x) => x.schema === XyoBoundWitnessSchema) as XyoBoundWitness[]
  const payloads: XyoPayload[] = all.filter((x) => x.schema !== XyoBoundWitnessSchema)
  return [boundWitnesses, payloads]
}

const flatten = (boundWitness: XyoBoundWitnessWithPartialMeta): XyoPayload[] => {
  const payloads: XyoPayload[] =
    boundWitness?._payloads
      ?.map((payload) => {
        return payload.schema === XyoBoundWitnessSchema ? flatten(payload as XyoBoundWitnessWithPartialMeta) : payload
      })
      .flatMap((x) => x) || []
  return ([boundWitness] as XyoPayload[]).concat(payloads)
}
