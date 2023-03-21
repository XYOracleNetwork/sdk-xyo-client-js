import { assertEx } from '@xylabs/assert'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWithPartialMeta, PayloadWithPartialMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account'
import { getNewPayloads, knownPayload } from '../Payload'

export const knownBlock = new BoundWitnessBuilder({ inlinePayloads: true })
  .witness(unitTestSigningAccount)
  .payload(knownPayload)
  .build()[0] as BoundWitness & PayloadWithPartialMeta

export const knownBlockHash = assertEx(knownBlock._hash)

export const getNewBlock = (...payloads: Payload[]): BoundWitnessWithPartialMeta & PayloadWithPartialMeta => {
  return new BoundWitnessBuilder({ inlinePayloads: true }).witness(unitTestSigningAccount).payloads(payloads).build()[0]
}

export const getNewBlockWithPayloads = (numPayloads = 1) => {
  return getNewBlock(...getNewPayloads(numPayloads))
}

export const getNewBlocks = (numBoundWitnesses = 1): Array<BoundWitnessWithPartialMeta & PayloadWithPartialMeta> => {
  return new Array(numBoundWitnesses).fill(0).map(() => {
    return new BoundWitnessBuilder({ inlinePayloads: true }).witness(unitTestSigningAccount).build()[0]
  })
}

export const getNewBlocksWithPayloads = (numBoundWitnesses = 1, numPayloads = 1): Array<BoundWitnessWithPartialMeta & PayloadWithPartialMeta> => {
  return new Array(numBoundWitnesses).fill(0).map(() => {
    return new BoundWitnessBuilder({ inlinePayloads: true }).witness(unitTestSigningAccount).payloads(getNewPayloads(numPayloads)).build()[0]
  })
}
