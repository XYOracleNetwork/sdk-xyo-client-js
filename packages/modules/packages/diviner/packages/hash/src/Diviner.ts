import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { creatableModule } from '@xyo-network/module-model'
import { Payload, WithSources } from '@xyo-network/payload-model'

import { HashLeaseEstimateDivinerConfigSchema } from './Config'
import { HashLeaseEstimateDivinerParams } from './Params'
import { HashLeaseEstimate, HashLeaseEstimateSchema } from './Payload'

@creatableModule()
export class HashLeaseEstimateDiviner<
  TParams extends HashLeaseEstimateDivinerParams = HashLeaseEstimateDivinerParams,
  TIn extends Payload = Payload,
> extends AbstractDiviner<TParams, TIn, HashLeaseEstimate> {
  static override configSchemas = [HashLeaseEstimateDivinerConfigSchema]
  static override targetSchema = HashLeaseEstimateSchema

  protected override async divineHandler(_payloads: TIn[] = []): Promise<WithSources<HashLeaseEstimate>[]> {
    return await Promise.resolve([])
  }
}
