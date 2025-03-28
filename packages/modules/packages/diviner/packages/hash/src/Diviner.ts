import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { creatableModule } from '@xyo-network/module-model'
import { Payload, Schema } from '@xyo-network/payload-model'

import { HashLeaseEstimateDivinerConfigSchema } from './Config.ts'
import { HashLeaseEstimateDivinerParams } from './Params.ts'
import { HashLeaseEstimate, HashLeaseEstimateSchema } from './Payload/index.ts'

@creatableModule()
export class HashLeaseEstimateDiviner<
  TParams extends HashLeaseEstimateDivinerParams = HashLeaseEstimateDivinerParams,
  TIn extends Payload = Payload,
  TOut extends HashLeaseEstimate | Payload = HashLeaseEstimate | Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, HashLeaseEstimateDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = HashLeaseEstimateDivinerConfigSchema
  static override readonly targetSchema = HashLeaseEstimateSchema

  protected override async divineHandler(_payloads: TIn[] = []): Promise<TOut[]> {
    return await Promise.resolve([])
  }
}
