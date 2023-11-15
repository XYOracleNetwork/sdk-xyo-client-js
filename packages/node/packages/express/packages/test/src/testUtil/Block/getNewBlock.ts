import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { Payload } from '@xyo-network/payload-model'
import { BoundWitnessWithPartialMeta, PayloadWithPartialMeta } from '@xyo-network/payload-mongodb'

import { unitTestSigningAccount } from '../Account'
import { getNewPayloads } from '../Payload'

export const getNewBlock = async (...payloads: Payload[]): Promise<BoundWitnessWithPartialMeta & PayloadWithPartialMeta> => {
  return (
    await new BoundWitnessBuilder({ inlinePayloads: true })
      .witness(await unitTestSigningAccount())
      .payloads(payloads)
      .build()
  )[0]
}

export const getNewBlockWithPayloads = (numPayloads = 1) => {
  return getNewBlock(...getNewPayloads(numPayloads))
}

export const getNewBlocks = async (numBoundWitnesses = 1): Promise<Array<BoundWitnessWithPartialMeta & PayloadWithPartialMeta>> => {
  const sequence = new Array(numBoundWitnesses).fill(0)
  const values = await Promise.all(
    sequence.map(async () => {
      return (await new BoundWitnessBuilder({ inlinePayloads: true }).witness(await unitTestSigningAccount()).build())[0]
    }),
  )
  return values
}

export const getNewBlocksWithPayloads = async (
  numBoundWitnesses = 1,
  numPayloads = 1,
): Promise<Array<BoundWitnessWithPartialMeta & PayloadWithPartialMeta>> => {
  return await Promise.all(
    new Array(numBoundWitnesses).fill(0).map(async () => {
      return (
        await new BoundWitnessBuilder({ inlinePayloads: true })
          .witness(await unitTestSigningAccount())
          .payloads(getNewPayloads(numPayloads))
          .build()
      )[0]
    }),
  )
}
