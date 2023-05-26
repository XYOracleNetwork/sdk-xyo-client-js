import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitnessBuilder, BoundWitnessBuilderConfig } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account'
import { getNewPayloads } from '../Payload'

const config: BoundWitnessBuilderConfig = { inlinePayloads: false, timestamp: true }

export const getNewBoundWitness = async (
  signers: AccountInstance[] = [unitTestSigningAccount],
  payloads: Payload[] = getNewPayloads(1),
): Promise<[BoundWitness, Payload[]]> => {
  return await new BoundWitnessBuilder(config).payloads(payloads).witnesses(signers).build()
}

export const getNewBoundWitnesses = async (
  signers: AccountInstance[] = [unitTestSigningAccount],
  numBoundWitnesses = 1,
  numPayloads = 1,
): Promise<[BoundWitness, Payload[]][]> => {
  const response: [BoundWitness, Payload[]][] = []
  for (let i = 0; i < numBoundWitnesses; i++) {
    response.push(await getNewBoundWitness(signers, getNewPayloads(numPayloads)))
  }
  return response
}
