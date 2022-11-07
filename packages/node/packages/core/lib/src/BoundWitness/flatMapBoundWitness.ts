import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoBoundWitnessWithPartialMeta } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload'

export type BoundWitnessMapResult = [Array<XyoBoundWitness>, Array<XyoPayload>]

export const flatMapBoundWitness = (boundWitness: XyoBoundWitnessWithPartialMeta): BoundWitnessMapResult => {
  const all = flatten(boundWitness)
  const boundWitnesses: XyoBoundWitness[] = all.filter((x) => x.schema === 'network.xyo.boundwitness') as XyoBoundWitness[]
  const payloads: XyoPayload[] = all.filter((x) => x.schema !== 'network.xyo.boundwitness')
  return [boundWitnesses, payloads]
}

const flatten = (boundWitness: XyoBoundWitnessWithPartialMeta): XyoPayload[] => {
  const payloads: XyoPayload[] =
    boundWitness?._payloads
      ?.map((payload) => {
        return payload.schema === 'network.xyo.boundwitness' ? flatten(payload as XyoBoundWitnessWithPartialMeta) : payload
      })
      .flatMap((x) => x) || []
  return ([boundWitness] as XyoPayload[]).concat(payloads)
}
