import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitnessWithPartialMeta, PayloadWithPartialMeta } from '@xyo-network/node-core-model'

import { unitTestSigningAccount } from '../Account'
import { getPayloads } from '../Payload'

export const getBlocks = (numBoundWitnesses = 1): Array<BoundWitnessWithPartialMeta & PayloadWithPartialMeta> => {
  return new Array(numBoundWitnesses).fill(0).map(() => {
    return new BoundWitnessBuilder({ inlinePayloads: true }).witness(unitTestSigningAccount).build()[0]
  })
}

export const getBlocksWithPayloads = (numBoundWitnesses = 1, numPayloads = 1): Array<BoundWitnessWithPartialMeta & PayloadWithPartialMeta> => {
  return new Array(numBoundWitnesses).fill(0).map(() => {
    return new BoundWitnessBuilder({ inlinePayloads: true }).witness(unitTestSigningAccount).payloads(getPayloads(numPayloads)).build()[0]
  })
}
