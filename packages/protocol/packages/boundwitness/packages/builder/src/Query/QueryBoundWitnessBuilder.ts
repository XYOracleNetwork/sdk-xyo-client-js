import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { QueryBoundWitness, QueryBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload'
import { Payload, Query, WithMeta } from '@xyo-network/payload-model'

import { BoundWitnessBuilder } from '../Builder.ts'

export class QueryBoundWitnessBuilder<
  TBoundWitness extends QueryBoundWitness = QueryBoundWitness,
  TQuery extends Query = Query,
> extends BoundWitnessBuilder<TBoundWitness> {
  private _additional?: Hash[]
  private _query: WithMeta<TQuery> | undefined

  async additional(additional: Payload[]) {
    this._additional = await PayloadBuilder.dataHashes(additional)
    return this
  }

  override async dataHashableFields(): Promise<Omit<TBoundWitness, '$hash' | '$meta'>> {
    const fields = {
      ...(await super.dataHashableFields()),
      query: assertEx(this._query, () => 'No Query Specified').$hash,
      schema: QueryBoundWitnessSchema,
    } as Omit<TBoundWitness, '$hash' | '$meta'>
    if (this._additional) {
      fields.additional = this._additional
    }
    return fields
  }

  async query<T extends TQuery>(query: T) {
    this._query = await PayloadBuilder.build(query)
    this.payload(this._query)
    return this
  }
}
