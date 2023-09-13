import type { BoundWitnessWithMeta } from '@xyo-network/node-core-model'

export const removePayloads = (boundWitnesses: BoundWitnessWithMeta[]): BoundWitnessWithMeta[] => {
  return boundWitnesses.map((boundWitness) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _payloads, ...sanitized } = boundWitness
    return { ...sanitized } as BoundWitnessWithMeta
  })
}
