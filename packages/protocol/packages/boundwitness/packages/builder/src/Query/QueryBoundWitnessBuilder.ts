import { assertEx } from '@xylabs/assert'
import { QueryBoundWitness, QueryBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { Query } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { BoundWitnessBuilder } from '../Builder'

export class QueryBoundWitnessBuilder<
  TBoundWitness extends QueryBoundWitness = QueryBoundWitness,
  TQuery extends Query = Query,
> extends BoundWitnessBuilder<TBoundWitness> {
  private _query: PayloadWrapper<TQuery> | undefined

  override async hashableFields(): Promise<TBoundWitness> {
    return {
      ...(await super.hashableFields()),
      query: assertEx(await this._query?.hashAsync(), 'No Query Specified'),
      schema: QueryBoundWitnessSchema,
    }
  }

  query<T extends TQuery>(query: T) {
    this._query = PayloadWrapper.wrap(query)
    this.payload(this._query.payload())
    return this
  }
}
