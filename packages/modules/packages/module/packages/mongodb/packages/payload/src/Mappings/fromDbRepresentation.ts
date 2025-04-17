import type { JsonObject } from '@xylabs/object'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'

import type { BoundWitnessWithMongoMeta } from '../BoundWitness/index.ts'
import type { PayloadWithMongoMeta } from '../Payload/index.js'

export const payloadFromDbRepresentation = <T extends Payload = Payload>(value: PayloadWithMongoMeta<T>): WithStorageMeta<T> => {
  const clone: JsonObject = structuredClone(value) as unknown as JsonObject
  const metaNormalized: JsonObject = {}
  for (const key of Object.keys(clone)) {
    if (key.startsWith('_$')) {
      // remove _ from _$ fields
      metaNormalized[key.slice(1)] = clone[key]
    } else if (key !== '_id') {
      // special case for _id, which is reserved by MongoDB
      metaNormalized[key] = clone[key]
    }
  }
  return PayloadBuilder.omitPrivateStorageMeta(metaNormalized as Payload) as WithStorageMeta<T>
}

export const boundWitnessFromDbRepresentation = <T extends BoundWitness = BoundWitness>(value: BoundWitnessWithMongoMeta<T>): WithStorageMeta<T> => {
  return payloadFromDbRepresentation(value)
}

export const fromDbRepresentation = <T extends Payload = Payload>(value: PayloadWithMongoMeta<T>): WithStorageMeta<T> => {
  return isBoundWitness(value)
    ? (boundWitnessFromDbRepresentation(value))
    : (payloadFromDbRepresentation(value))
}
