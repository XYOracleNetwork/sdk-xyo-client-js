import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { Schema } from '@xyo-network/payload-model'

import { boundWitnessContainsAll } from '../util/index.ts'

/**
 * Checks if the boundwitness contains all of the payload schemas
 * @param bw The boundwitness to check
 * @param payloadSchemas The payload schemas to check for
 * @returns True if the boundwitness contains all of the payload schemas
 */
export const payloadSchemasContainsAll = (bw: BoundWitness, payloadSchemas: Schema[]): boolean => {
  return boundWitnessContainsAll(bw, 'payload_schemas', payloadSchemas)
}
