import { assertEx } from '@xylabs/assert'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoBoundWitnessWithPartialMeta, XyoPayloadWithPartialMeta } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account'
import { getPayloads, knownPayload } from '../Payload'

export const knownBlock = new BoundWitnessBuilder({ inlinePayloads: true })
  .witness(unitTestSigningAccount)
  .payload(knownPayload)
  .build()[0] as XyoBoundWitness & XyoPayloadWithPartialMeta
export const knownBlockHash = assertEx(knownBlock._hash)

export const getBlock = (...payloads: XyoPayload[]): XyoBoundWitnessWithPartialMeta & XyoPayloadWithPartialMeta => {
  return new BoundWitnessBuilder({ inlinePayloads: true }).witness(unitTestSigningAccount).payloads(payloads).build()[0]
}

export const getBlockWithPayloads = (numPayloads = 1) => {
  return getBlock(...getPayloads(numPayloads))
}
