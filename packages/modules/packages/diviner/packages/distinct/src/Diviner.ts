import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { DistinctDivinerConfig, DistinctDivinerConfigSchema } from '@xyo-network/diviner-distinct-model'
import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, Schema } from '@xyo-network/payload-model'

export type DistinctDivinerParams = DivinerParams<AnyConfigSchema<DistinctDivinerConfig>>

export class DistinctDiviner<TParams extends DistinctDivinerParams = DistinctDivinerParams> extends AbstractDiviner<TParams, Payload, Payload> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, DistinctDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = DistinctDivinerConfigSchema

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const map = await PayloadBuilder.toDataHashMap(payloads ?? [])
    return Object.values(map)
  }
}
