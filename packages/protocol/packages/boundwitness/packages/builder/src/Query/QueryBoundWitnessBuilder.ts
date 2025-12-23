import { assertEx } from '@xylabs/sdk-js'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload'
import type { Query, WithoutMeta } from '@xyo-network/payload-model'

import { BoundWitnessBuilder } from '../BoundWitnessBuilder.ts'

export class QueryBoundWitnessBuilder<
  TBoundWitness extends QueryBoundWitness = QueryBoundWitness,
  TQuery extends Query = Query,
> extends BoundWitnessBuilder<TBoundWitness> {
  private _query: TQuery | undefined

  override async dataHashableFields(): Promise<WithoutMeta<TBoundWitness>> {
    const fields = {
      ...(await super.dataHashableFields()),
      query: await PayloadBuilder.dataHash(assertEx(this._query, () => 'No Query Specified')),
    } as TBoundWitness
    return { ...fields } as WithoutMeta<TBoundWitness>
  }

  query<T extends TQuery>(query: T) {
    this.payload(query)
    this._query = query
    return this
  }
}
