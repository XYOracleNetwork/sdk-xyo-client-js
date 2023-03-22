import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account'
import { getNewPayloads } from '../Payload'

export const getNewBoundWitness = (account = unitTestSigningAccount, payloads: Payload[] = getNewPayloads(1)) => {
  return new BoundWitnessBuilder().payloads(payloads).witness(account).build()
}

export const getNewBoundWitnesses = (account = unitTestSigningAccount, numBoundWitnesses = 1, numPayloads = 1) => {
  return new Array(numBoundWitnesses).fill(0).map(() => getNewBoundWitness(account, getNewPayloads(numPayloads)))
}
