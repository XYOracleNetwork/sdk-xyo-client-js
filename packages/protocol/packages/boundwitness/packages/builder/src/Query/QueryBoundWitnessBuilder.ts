import { assertEx } from '@xylabs/assert'
import type { Hash } from '@xylabs/hex'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload'
import type {
  Payload, Query, WithoutMeta,
} from '@xyo-network/payload-model'

import { BoundWitnessBuilder } from '../Builder.ts'

export class QueryBoundWitnessBuilder<
  TBoundWitness extends QueryBoundWitness = QueryBoundWitness,
  TQuery extends Query = Query,
> extends BoundWitnessBuilder<TBoundWitness> {
  private _additional?: Hash[]
  private _query: TQuery | undefined

  async additional(additional: Payload[]) {
    this._additional = await PayloadBuilder.dataHashes(additional)
    return this
  }

  override async dataHashableFields(): Promise<WithoutMeta<TBoundWitness>> {
    const fields = {
      ...(await super.dataHashableFields()),
      query: await PayloadBuilder.dataHash(assertEx(this._query, () => 'No Query Specified')),
    } as TBoundWitness
    if (this._additional) {
      fields.additional = this._additional
    }
    return { ...fields } as WithoutMeta<TBoundWitness>
  }

  query<T extends TQuery>(query: T) {
    this.payload(query)
    this._query = query
    return this
  }
}
