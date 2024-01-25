import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { DistinctDivinerConfig, DistinctDivinerConfigSchema } from '@xyo-network/diviner-distinct-model'
import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadWithMeta } from '@xyo-network/payload-model'

export type DistinctDivinerParams = DivinerParams<AnyConfigSchema<DistinctDivinerConfig>>

export class DistinctDiviner<TParams extends DistinctDivinerParams = DistinctDivinerParams> extends AbstractDiviner<TParams, Payload, Payload> {
  static override configSchemas = [DistinctDivinerConfigSchema]

  protected override async divineHandler(payloads?: PayloadWithMeta[]): Promise<PayloadWithMeta[]> {
    const map = await PayloadBuilder.toMap(payloads ?? [])
    const values = Object.values(map)
    return values
  }
}
