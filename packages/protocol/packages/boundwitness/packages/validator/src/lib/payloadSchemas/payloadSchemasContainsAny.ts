import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Schema } from '@xyo-network/payload-model'

import { boundWitnessArrayPropertyContainsAny } from '../util/index.ts'

/**
 * Checks if the boundwitness contains any of the payload schemas. If the payload schemas array
 * is empty, it will return true. This is to match the behavior or payload schemasContainsAll
 * which will return true if the payload schemas array is empty.
 * @param bw The boundwitness to check
 * @param payloadSchemas The payload schemas to check for
 * @returns True if the boundwitness contains any of the payload schemas
 */
export const payloadSchemasContainsAny = (bw: BoundWitness, payloadSchemas: Schema[]): boolean => {
  return boundWitnessArrayPropertyContainsAny(bw, 'payload_schemas', payloadSchemas)
}
