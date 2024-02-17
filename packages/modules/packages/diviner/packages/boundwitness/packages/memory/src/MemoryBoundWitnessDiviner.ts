import { containsAll } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { hexFromHexString } from '@xylabs/hex'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import {
  BoundWitnessDivinerConfigSchema,
  BoundWitnessDivinerParams,
  BoundWitnessDivinerQueryPayload,
  isBoundWitnessDivinerQueryPayload,
} from '@xyo-network/diviner-boundwitness-model'
import { WithMeta } from '@xyo-network/payload-model'

export interface EqualityComparisonOperators {
  /**
   * 'Not Equal To' comparison operator.
   * Compares the field with the specified string value,
   * selecting records where the field value does not match the provided string.
   * Example: field != 'value'
   */
  '!=': string

  /**
   * 'Less Than' comparison operator.
   * Compares the field with the specified string value,
   * selecting records where the field value is lexicographically less than the provided string.
   * Example: field < 'value'
   */
  '<': string

  /**
   * 'Less Than or Equal To' comparison operator.
   * Compares the field with the specified string value,
   * selecting records where the field value is lexicographically less than or equal to the provided string.
   * Example: field <= 'value'
   */
  '<=': string

  /**
   * 'Equal To' comparison operator.
   * Compares the field with the specified string value,
   * selecting records where the field value matches the provided string exactly.
   * Example: field = 'value'
   */
  '=': string

  /**
   * 'Greater Than' comparison operator.
   * Compares the field with the specified string value,
   * selecting records where the field value is lexicographically greater than the provided string.
   * Example: field > 'value'
   */
  '>': string

  /**
   * 'Greater Than or Equal To' comparison operator.
   * Compares the field with the specified string value,
   * selecting records where the field value is lexicographically greater than or equal to the provided string.
   * Example: field >= 'value'
   */
  '>=': string
}

type WithTimestamp = BoundWitness & { timestamp: number }
const hasTimestamp = (bw: BoundWitness): bw is WithTimestamp => bw.timestamp !== undefined

export class MemoryBoundWitnessDiviner<
  TParams extends BoundWitnessDivinerParams = BoundWitnessDivinerParams,
  TIn extends BoundWitnessDivinerQueryPayload = BoundWitnessDivinerQueryPayload,
  TOut extends BoundWitness = BoundWitness,
> extends BoundWitnessDiviner<TParams, TIn, TOut> {
  static override configSchemas = [BoundWitnessDivinerConfigSchema]

  protected override async divineHandler(payloads?: TIn[]) {
    const filter = assertEx(payloads?.filter(isBoundWitnessDivinerQueryPayload)?.pop(), 'Missing query payload')
    if (!filter) return []
    const archivist = assertEx(await this.getArchivist(), 'Unable to resolve archivist')
    const { addresses, payload_hashes, payload_schemas, limit, offset, order, sourceQuery, destination, timestamp } = filter
    let bws = ((await archivist?.all?.()) ?? []).filter(isBoundWitness) as WithMeta<BoundWitness>[]
    if (order === 'desc') bws = bws.reverse()
    const allAddresses = addresses?.map((address) => hexFromHexString(address)).filter(exists)
    if (allAddresses?.length) bws = bws.filter((bw) => containsAll(bw.addresses, allAddresses))
    if (payload_hashes?.length) bws = bws.filter((bw) => containsAll(bw.payload_hashes, payload_hashes))
    if (payload_schemas?.length) bws = bws.filter((bw) => containsAll(bw.payload_schemas, payload_schemas))
    if (sourceQuery) bws = bws.filter((bw) => (bw?.$meta as { sourceQuery?: string })?.sourceQuery === sourceQuery)
    // If there's a destination filter of the right kind
    if (destination && Array.isArray(destination) && destination?.length > 0) {
      const targetFilter = assertEx(destination, 'Missing destination')
      // Find all BWs that satisfy the destination constraint
      bws = bws.filter((bw) => {
        const targetDestinationField = (bw?.$meta as { destination?: string[] })?.destination
        // If the destination field is an array and contains at least one element
        return targetDestinationField !== undefined && Array.isArray(targetDestinationField) && targetDestinationField.length > 0 ?
            // Check that the targetDestinationField contains all the elements in the targetFilter
            containsAll(targetFilter, targetDestinationField ?? [])
            // Otherwise, filter it out
          : false
      })
    }
    if (timestamp !== undefined) {
      bws =
        order === 'desc' ?
          bws.filter(hasTimestamp).filter((bw) => bw.timestamp <= timestamp)
        : bws.filter(hasTimestamp).filter((bw) => bw.timestamp >= timestamp)
    }
    const parsedLimit = limit ?? bws.length
    const parsedOffset = offset ?? 0
    return bws.slice(parsedOffset, parsedLimit) as WithMeta<TOut>[]
  }
}
