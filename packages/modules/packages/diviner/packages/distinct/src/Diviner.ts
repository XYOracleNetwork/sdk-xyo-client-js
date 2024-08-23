import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { DistinctDivinerConfig } from '@xyo-network/diviner-distinct-model'
import { DistinctDivinerConfigSchema } from '@xyo-network/diviner-distinct-model'
import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Payload, PayloadWithMeta, Schema,
} from '@xyo-network/payload-model'

export type DistinctDivinerParams = DivinerParams<AnyConfigSchema<DistinctDivinerConfig>>

export class DistinctDiviner<TParams extends DistinctDivinerParams = DistinctDivinerParams> extends AbstractDiviner<TParams, Payload, Payload> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, DistinctDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = DistinctDivinerConfigSchema

  protected override async divineHandler(payloads?: PayloadWithMeta[]): Promise<PayloadWithMeta[]> {
    const map = await PayloadBuilder.toDataHashMap(payloads ?? [])
    return Object.values(map)
  }
}
