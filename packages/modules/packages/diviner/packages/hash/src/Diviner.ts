import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { creatableModule } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { HashLeaseEstimateDivinerConfigSchema } from './Config'
import { HashLeaseEstimateDivinerParams } from './Params'
import { HashLeaseEstimate, HashLeaseEstimateSchema } from './Payload'

@creatableModule()
export class HashLeaseEstimateDiviner<
  TParams extends HashLeaseEstimateDivinerParams = HashLeaseEstimateDivinerParams,
  TIn extends Payload = Payload,
  TOut extends HashLeaseEstimate = HashLeaseEstimate,
> extends AbstractDiviner<TParams, TIn, TOut> {
  static override configSchemas = [HashLeaseEstimateDivinerConfigSchema]
  static override targetSchema = HashLeaseEstimateSchema

  protected override async divineHandler(_payloads: TIn[] = []): Promise<TOut[]> {
    return await Promise.resolve([])
  }
}
