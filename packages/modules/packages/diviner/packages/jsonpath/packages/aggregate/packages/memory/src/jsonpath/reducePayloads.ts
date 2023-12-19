import { SchemaToPayloadTransformersDictionary } from '@xyo-network/diviner-jsonpath-aggregate-model'
import { PayloadHasher } from '@xyo-network/hash'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadFields } from '@xyo-network/payload-model'

/**
 * Reduces the payloads to a single payload using the supplied transformers
 * @param payloads The payloads to reduce
 * @param payloadTransformers The transformers to use to convert the payloads to the destination payload
 * @param destinationSchema The schema of the destination payload
 * @param excludeSources Exclude the source hashes from the destination payload
 * @returns The reduced payload
 */
export const reducePayloads = async <T extends Payload = Payload>(
  payloads: Payload[],
  payloadTransformers: SchemaToPayloadTransformersDictionary,
  destinationSchema: string,
  excludeSources = false,
): Promise<T> => {
  // Use the payload transformers to convert the fields from the source payloads to the destination fields
  const payloadFields = payloads.flatMap<PayloadFields[]>((payload) => {
    // Find the transformers for this payload
    const transformers = payloadTransformers[payload.schema]
    // If transformers exist, apply them to the payload otherwise return an empty array
    return transformers ? transformers.map((transform) => transform(payload)) : []
  })
  // Include all the sources for reference
  const baseObject = excludeSources ? {} : { sources: (await PayloadHasher.hashPairs([...payloads])).map(([, hash]) => hash) }
  // Build and return the payload
  return await new PayloadBuilder<T>({ schema: destinationSchema }).fields(Object.assign(baseObject, ...payloadFields)).build()
}

/**
 * Reduces the arrays of payload arrays to an array of payloads using the supplied transformers
 * @param payloadsArray The arrays of payloads to reduce
 * @param payloadTransformers The transformers to use to convert the payloads to the destination payloads
 * @param excludeSources Exclude the source hashes from the destination payload
 * @returns The reduced payloads
 */
export const reducePayloadsArray = async <T extends Payload = Payload>(
  payloadsArray: Payload[][],
  payloadTransformers: SchemaToPayloadTransformersDictionary,
  destinationSchema: string,
  excludeSources = false,
): Promise<T[]> => {
  return await Promise.all(
    payloadsArray.map(async (payloads) => {
      return await reducePayloads<T>(payloads, payloadTransformers, destinationSchema, excludeSources)
    }),
  )
}
