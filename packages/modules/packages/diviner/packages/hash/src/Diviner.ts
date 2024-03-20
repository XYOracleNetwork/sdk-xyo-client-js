import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { DivinerConfig, DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module-model'
import { Payload, WithSources } from '@xyo-network/payload-model'

export const HashLeaseEstimateDivinerConfigSchema = 'network.xyo.diviner.hash.lease.estimate.config'
export type HashLeaseEstimateDivinerConfigSchema = typeof HashLeaseEstimateDivinerConfigSchema

export type HashLeaseEstimateDivinerConfig = DivinerConfig<
  {
    //
  },
  HashLeaseEstimateDivinerConfigSchema
>

export type HashLeaseEstimateDivinerParams<
  TConfig extends AnyConfigSchema<HashLeaseEstimateDivinerConfig> = AnyConfigSchema<HashLeaseEstimateDivinerConfig>,
> = DivinerParams<TConfig>

export const HashLeaseSchema = 'network.xyo.hash.lease'
export type HashLeaseSchema = typeof HashLeaseSchema

export type HashLease = Payload<
  {
    expire: number
  },
  HashLeaseSchema
>

export const HashLeaseEstimateSchema = 'network.xyo.hash.lease.estimate'
export type HashLeaseEstimateSchema = typeof HashLeaseEstimateSchema

export type HashLeaseEstimate = Payload<{ currency: string; price: number }, HashLeaseEstimateSchema>

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
