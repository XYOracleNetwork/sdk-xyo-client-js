import { assertEx } from '@xylabs/assert'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import type {
  BoundWitnessDivinerParams,
  BoundWitnessDivinerQueryPayload,
} from '@xyo-network/diviner-boundwitness-model'
import { isBoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'

import { applyBoundWitnessDivinerQueryPayload } from './applyBoundWitnessDivinerQueryPayload.ts'

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

export class MemoryBoundWitnessDiviner<
  TParams extends BoundWitnessDivinerParams = BoundWitnessDivinerParams,
  TIn extends BoundWitnessDivinerQueryPayload = BoundWitnessDivinerQueryPayload,
  TOut extends BoundWitness = BoundWitness,
> extends BoundWitnessDiviner<TParams, TIn, TOut> {
  protected override async divineHandler(payloads?: TIn[]) {
    const filter = assertEx(payloads?.filter(isBoundWitnessDivinerQueryPayload)?.pop(), () => 'Missing query payload')
    if (!filter) return []
    const archivist = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    let bws = ((await archivist?.all?.()) ?? []).filter(isBoundWitness) as BoundWitness[]
    return applyBoundWitnessDivinerQueryPayload(filter, bws) as TOut[]
  }
}
