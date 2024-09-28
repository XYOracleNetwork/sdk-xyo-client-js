import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { hexFromHexString } from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import type { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import type { Payload, WithMeta } from '@xyo-network/payload-model'

type WithTimestamp = BoundWitness & { timestamp: number }
const hasTimestamp = (bw: BoundWitness): bw is WithTimestamp => bw.timestamp !== undefined

// eslint-disable-next-line complexity
export const applyBoundWitnessDivinerQueryPayload = (filter?: BoundWitnessDivinerQueryPayload, payloads: Payload[] = []) => {
  if (!filter) return []
  const {
    addresses, payload_hashes, payload_schemas, limit, offset, order = 'desc', sourceQuery, destination, timestamp,
  } = filter

  let bws = payloads.filter(isBoundWitness) as WithMeta<BoundWitness>[]
  if (order === 'desc') bws = bws.reverse()
  const allAddresses = addresses?.map(address => hexFromHexString(address)).filter(exists)
  if (allAddresses?.length) bws = bws.filter(bw => containsAll(bw.addresses, allAddresses))
  if (payload_hashes?.length) bws = bws.filter(bw => containsAll(bw.payload_hashes, payload_hashes))
  if (payload_schemas?.length) bws = bws.filter(bw => containsAll(bw.payload_schemas, payload_schemas))
  if (sourceQuery) bws = bws.filter(bw => (bw?.$meta as { sourceQuery?: string })?.sourceQuery === sourceQuery)
  // If there's a destination filter of the right kind
  if (destination && Array.isArray(destination) && destination?.length > 0) {
    const targetFilter = assertEx(destination, () => 'Missing destination')
    // Find all BWs that satisfy the destination constraint
    bws = bws.filter((bw) => {
      const targetDestinationField = (bw?.$meta as { destination?: string[] })?.destination
      // If the destination field is an array and contains at least one element
      return targetDestinationField !== undefined && Array.isArray(targetDestinationField) && targetDestinationField.length > 0
      // Check that the targetDestinationField contains all the elements in the targetFilter
        ? containsAll(targetFilter, targetDestinationField ?? [])
      // Otherwise, filter it out
        : false
    })
  }
  if (timestamp !== undefined) {
    bws
      = order === 'desc'
        ? bws.filter(hasTimestamp).filter(bw => bw.timestamp <= timestamp)
        : bws.filter(hasTimestamp).filter(bw => bw.timestamp >= timestamp)
  }
  const parsedLimit = limit ?? bws.length
  const parsedOffset = offset ?? 0
  return bws.slice(parsedOffset, parsedLimit)
}
