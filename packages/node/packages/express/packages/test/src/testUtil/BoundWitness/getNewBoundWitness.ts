import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitnessBuilder, BoundWitnessBuilderConfig } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleError, Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account'
import { getNewPayloads } from '../Payload'

const config: BoundWitnessBuilderConfig = { inlinePayloads: false, timestamp: true }

export const getNewBoundWitness = async (signers?: AccountInstance[], payloads?: Payload[]): Promise<[BoundWitness, Payload[], ModuleError[]]> => {
  const resolvedPayloads = payloads ?? (await getNewPayloads(1))
  return await new BoundWitnessBuilder(config)
    .payloads(resolvedPayloads)
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
    response.push(await getNewBoundWitness(signers ?? [await unitTestSigningAccount()], await getNewPayloads(numPayloads)))
  }
  return response
}
