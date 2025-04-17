import type { JsonObject } from '@xylabs/object'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'

import type { BoundWitnessMongoMeta } from '../BoundWitness/index.js'
import type { PayloadWithMongoMeta } from '../Payload/index.js'

export const payloadToDbRepresentation = <T extends Payload>(payload: WithStorageMeta<T>): PayloadWithMongoMeta<WithStorageMeta<T>> => {
  const clone: JsonObject = structuredClone(payload) as unknown as JsonObject
  const metaNormalized: JsonObject = {}
  for (const key of Object.keys(clone)) {
    if (key.startsWith('$')) {
      metaNormalized[`_${key}`] = clone[key]
    } else {
      metaNormalized[key] = clone[key]
    }
  }
  return (metaNormalized as unknown as PayloadWithMongoMeta<T>)
}

export const boundWitnessToDbRepresentation = <T extends BoundWitness>(bw: WithStorageMeta<T>): BoundWitnessMongoMeta<WithStorageMeta<T>> => {
  return payloadToDbRepresentation(bw) as BoundWitnessMongoMeta<WithStorageMeta<T>>
}

export const toDbRepresentation = <T extends Payload | BoundWitness>(value: WithStorageMeta<T>) => {
  return isBoundWitness(value) ? boundWitnessToDbRepresentation(value) : payloadToDbRepresentation(value)
}
