import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { Schema } from '@xyo-network/payload-model'

import { boundWitnessArrayPropertyContains } from '../util/index.ts'

/**
 * Checks if the boundwitness contains the payload schema
 * @param bw The boundwitness to check
 * @param schema The payload schema to check for
 * @returns True if the boundwitness contains the payload schema
 */
export const payloadSchemasContains = (bw: BoundWitness, schema: Schema): boolean => {
  return boundWitnessArrayPropertyContains(bw, 'payload_schemas', schema)
}
