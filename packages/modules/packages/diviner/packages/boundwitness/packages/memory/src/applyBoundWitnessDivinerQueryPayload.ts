import { containsAll, filterAs } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { hexFromHexString } from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { asBlock, asOptionalBoundWitness } from '@xyo-network/boundwitness-model'
import type { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  type Payload,
  SequenceConstants,
  type WithStorageMeta,
} from '@xyo-network/payload-model'

// eslint-disable-next-line complexity
export const applyBoundWitnessDivinerQueryPayload = (filter?: BoundWitnessDivinerQueryPayload, payloads: WithStorageMeta<Payload>[] = []): BoundWitness[] => {
  if (!filter) return []
  const {
    addresses, block, cursor, destination, limit, order = 'desc', payload_hashes, payload_schemas, sourceQuery,
  } = filter

  const sortedPayloads = PayloadBuilder.sortByStorageMeta(payloads, order === 'desc' ? -1 : 1)
  const parsedCursor = cursor ?? (order === 'desc') ? SequenceConstants.maxLocalSequence : SequenceConstants.minLocalSequence
  const parsedOffset = (order === 'desc')
    ? sortedPayloads.findIndex(bw => bw._sequence < parsedCursor)
    : sortedPayloads.findIndex(bw => bw._sequence > parsedCursor)
  if (parsedOffset === -1) return []
  const payloadSubset = sortedPayloads.slice(parsedOffset)

  let bws = filterAs(payloadSubset, asOptionalBoundWitness)
  const allAddresses = addresses?.map(address => hexFromHexString(address)).filter(exists)
  if (allAddresses?.length) bws = bws.filter(bw => containsAll(bw.addresses, allAddresses))
  if (payload_hashes?.length) bws = bws.filter(bw => containsAll(bw.payload_hashes, payload_hashes))
  if (payload_schemas?.length) bws = bws.filter(bw => containsAll(bw.payload_schemas, payload_schemas))
  if (sourceQuery) bws = bws.filter(bw => ((bw as { $sourceQuery?: string })?.$sourceQuery) === sourceQuery)
  // If there's a destination filter of the right kind
  if (destination && Array.isArray(destination) && destination?.length > 0) {
    const targetFilter = assertEx(destination, () => 'Missing destination')
    // Find all BWs that satisfy the destination constraint
    bws = bws.filter((bw) => {
      const targetDestinationField = (bw as { $destination?: string[] })?.$destination
      // If the destination field is an array and contains at least one element
      return targetDestinationField !== undefined && Array.isArray(targetDestinationField) && targetDestinationField.length > 0
      // Check that the targetDestinationField contains all the elements in the targetFilter
        ? containsAll(targetFilter, targetDestinationField ?? [])
      // Otherwise, filter it out
        : false
    })
  }
  if (block !== undefined) {
    bws = (order === 'desc'
      ? filterAs(bws, asBlock).filter(bw => bw.block <= block)
      : filterAs(bws, asBlock).filter(bw => bw.block >= block)) as WithStorageMeta<BoundWitness>[]
  }
  const parsedLimit = limit ?? bws.length
  return bws.slice(0, parsedLimit)
}
