import type { AccountInstance } from '@xyo-network/account-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { ModuleError, Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account/index.ts'
import { getNewPayloads } from '../Payload/index.ts'

export const getNewBoundWitness = async (signers?: AccountInstance[], payloads?: Payload[]): Promise<[BoundWitness, Payload[], ModuleError[]]> => {
  return await (new BoundWitnessBuilder().payloads(payloads ?? (getNewPayloads(1))))
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
