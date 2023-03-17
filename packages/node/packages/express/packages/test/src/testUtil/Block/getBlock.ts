import { assertEx } from '@xylabs/assert'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadWithPartialMeta, XyoBoundWitnessWithPartialMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account'
import { getPayloads, knownPayload } from '../Payload'

export const knownBlock = new BoundWitnessBuilder({ inlinePayloads: true })
  .witness(unitTestSigningAccount)
  .payload(knownPayload)
  .build()[0] as XyoBoundWitness & PayloadWithPartialMeta
export const knownBlockHash = assertEx(knownBlock._hash)

export const getBlock = (...payloads: Payload[]): XyoBoundWitnessWithPartialMeta & PayloadWithPartialMeta => {
  return new BoundWitnessBuilder({ inlinePayloads: true }).witness(unitTestSigningAccount).payloads(payloads).build()[0]
}

export const getBlockWithPayloads = (numPayloads = 1) => {
  return getBlock(...getPayloads(numPayloads))
}
