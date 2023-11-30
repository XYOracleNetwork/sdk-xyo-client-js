import { PayloadHasher } from '@xyo-network/core'
import { SchemaToPayloadTransformersDictionary } from '@xyo-network/diviner-temporal-indexing-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadFields } from '@xyo-network/payload-model'

export const reducePayloads = async (
  payloads: Payload[],
  payloadTransformers: SchemaToPayloadTransformersDictionary,
  destinationSchema: string,
): Promise<Payload> => {
  // Use the payload transformers to convert the fields from the source payloads to the destination fields
  const indexFields = payloads
    .map<PayloadFields[]>((payload) => {
      // Find the transformers for this payload
      const transformers = payloadTransformers[payload.schema]
      // If transformers exist, apply them to the payload otherwise return an empty array
      return transformers ? transformers.map((transform) => transform(payload)) : []
    })
    .flat()
  // Include all the sources for reference
  const sources = (await PayloadHasher.hashPairs([...payloads])).map(([, hash]) => hash)
  // Build and return the index
  return new PayloadBuilder<Payload>({ schema: destinationSchema }).fields(Object.assign({ sources }, ...indexFields)).build()
}

export const reducePayloadsArray = async (
  payloadsArray: Payload[][],
  payloadTransformers: SchemaToPayloadTransformersDictionary,
  destinationSchema: string,
): Promise<Payload[]> => {
  return await Promise.all(
    payloadsArray.map(async (payloads) => {
      return await reducePayloads(payloads, payloadTransformers, destinationSchema)
    }),
  )
}
