import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitnessBuilder, BoundWitnessBuilderConfig } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleError, Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account'
import { getNewPayloads } from '../Payload'

const config: BoundWitnessBuilderConfig = { inlinePayloads: false, timestamp: true }

export const getNewBoundWitness = async (
  signers?: AccountInstance[],
  payloads: Payload[] = getNewPayloads(1),
): Promise<[BoundWitness, Payload[], ModuleError[]]> => {
  return await new BoundWitnessBuilder(config)
    .payloads(payloads)
    .witnesses(signers ?? [await unitTestSigningAccount()])
    .build()
}

export const getNewBoundWitnesses = async (
  signers?: AccountInstance[],
  numBoundWitnesses = 1,
  numPayloads = 1,
): Promise<[BoundWitness, Payload[], ModuleError[]][]> => {
  const response: [BoundWitness, Payload[], ModuleError[]][] = []
  for (let i = 0; i < numBoundWitnesses; i++) {
    response.push(await getNewBoundWitness(signers ?? [await unitTestSigningAccount()], getNewPayloads(numPayloads)))
  }
  return response
}
