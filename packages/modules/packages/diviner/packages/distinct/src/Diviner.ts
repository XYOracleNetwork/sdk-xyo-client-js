import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DistinctDivinerConfig, DistinctDivinerConfigSchema } from '@xyo-network/diviner-distinct-model'
import { DivinerParams } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type DistinctDivinerParams = DivinerParams<AnyConfigSchema<DistinctDivinerConfig>>

export class DistinctDiviner<TParams extends DistinctDivinerParams = DistinctDivinerParams> extends AbstractDiviner<TParams, Payload, Payload> {
  static override configSchemas = [DistinctDivinerConfigSchema]

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const map = await PayloadHasher.toMap(payloads ?? [])
    const values = Object.values(map)
    return values
  }
}
