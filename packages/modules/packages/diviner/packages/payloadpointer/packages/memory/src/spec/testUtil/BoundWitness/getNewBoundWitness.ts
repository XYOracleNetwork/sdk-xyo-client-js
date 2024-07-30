import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleError, Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account/index.js'
import { getNewPayloads } from '../Payload/index.js'

export const getNewBoundWitness = async (signers?: AccountInstance[], payloads?: Payload[]): Promise<[BoundWitness, Payload[], ModuleError[]]> => {
  return await (await new BoundWitnessBuilder().payloads(payloads ?? (await getNewPayloads(1))))
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
