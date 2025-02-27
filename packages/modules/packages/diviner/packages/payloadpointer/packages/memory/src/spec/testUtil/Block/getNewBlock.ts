import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account/index.ts'
// import { getNewPayloads } from '../Payload/index.ts'

export const getNewBlock = async (...payloads: Payload[]): Promise<BoundWitness> => {
  return (await (new BoundWitnessBuilder().witness(await unitTestSigningAccount()).payloads(payloads)).build())[0]
}

/*
export const getNewBlockWithPayloads = async (numPayloads = 1) => {
  return getNewBlock(...(getNewPayloads(numPayloads)))
}

export const getNewBlocks = async (numBoundWitnesses = 1): Promise<Array<BoundWitness>> => {
  const sequence = Array.from({ length: numBoundWitnesses }).fill(0)
  return await Promise.all(
    sequence.map(async () => {
      return (await new BoundWitnessBuilder().witness(await unitTestSigningAccount()).build())[0]
    }),
  )
}

export const getNewBlocksWithPayloads = async (numBoundWitnesses = 1, numPayloads = 1): Promise<Array<BoundWitness>> => {
  return await Promise.all(
    Array.from({ length: numBoundWitnesses })
      .fill(0)
      .map(async () => {
        return (
          await (new BoundWitnessBuilder().witness(await unitTestSigningAccount()).payloads(getNewPayloads(numPayloads))).build()
        )[0]
      }),
  )
}

*/
