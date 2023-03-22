import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account'
import { getNewPayloads } from '../Payload'

export const getNewBoundWitness = (signers = [unitTestSigningAccount], payloads: Payload[] = getNewPayloads(1)) => {
  return new BoundWitnessBuilder().payloads(payloads).witnesses(signers).build()
}

export const getNewBoundWitnesses = (signers = [unitTestSigningAccount], numBoundWitnesses = 1, numPayloads = 1) => {
  return new Array(numBoundWitnesses).fill(0).map(() => getNewBoundWitness(signers, getNewPayloads(numPayloads)))
}
