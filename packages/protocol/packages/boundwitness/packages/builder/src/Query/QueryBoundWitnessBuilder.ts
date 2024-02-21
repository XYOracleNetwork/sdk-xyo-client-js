import { assertEx } from '@xylabs/assert'
import { QueryBoundWitness, QueryBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload'
import { Query, WithMeta } from '@xyo-network/payload-model'

import { BoundWitnessBuilder } from '../Builder'

export class QueryBoundWitnessBuilder<
  TBoundWitness extends QueryBoundWitness = QueryBoundWitness,
  TQuery extends Query = Query,
> extends BoundWitnessBuilder<TBoundWitness> {
  private _query: WithMeta<TQuery> | undefined

  override async dataHashableFields(): Promise<Omit<TBoundWitness, '$hash' | '$meta'>> {
    return {
      ...(await super.dataHashableFields()),
      query: assertEx(this._query, 'No Query Specified').$hash,
      schema: QueryBoundWitnessSchema,
    } as Omit<TBoundWitness, '$hash' | '$meta'>
  }

  async query<T extends TQuery>(query: T) {
    this._query = await PayloadBuilder.build(query)
    this.payload(this._query)
    return this
  }
}
