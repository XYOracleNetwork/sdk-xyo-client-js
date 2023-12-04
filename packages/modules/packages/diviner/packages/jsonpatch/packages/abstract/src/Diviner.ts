import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import {
  PayloadTransformer,
  Transform,
  TransformDivinerConfig,
  TransformDivinerConfigSchema,
  TransformDivinerSchema,
} from '@xyo-network/diviner-jsonpatch-model'
import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type TransformDivinerParams = DivinerParams<AnyConfigSchema<TransformDivinerConfig>>

export abstract class AbstractTransformDiviner<TParams extends TransformDivinerParams = TransformDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [TransformDivinerConfigSchema]

  protected override divineHandler(payloads?: Payload[]): Payload[] {
    const jsonpatchs: Transform[] = []
    if (this.config.jsonpatch) {
      jsonpatchs.push({ jsonpatch: this.config.jsonpatch, schema: TransformDivinerSchema })
    }
    return jsonpatchs.map((jsonpatch) => payloads?.map(this.jsonpatcher(jsonpatch)) || []).flat()
  }

  protected abstract jsonpatcher<TSource extends Payload = Payload, TDestination extends Payload = Payload>(
    jsonpatch: Transform,
  ): PayloadTransformer<TSource, TDestination>
}
