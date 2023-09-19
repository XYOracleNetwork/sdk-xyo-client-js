import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerParams } from '@xyo-network/diviner-model'
import {
  isTransformDivinerQueryPayload,
  PayloadValueTransformer,
  TransformDivinerConfig,
  TransformDivinerConfigSchema,
  TransformDivinerQueryPayload,
} from '@xyo-network/diviner-transform-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Value, ValueSchema } from '@xyo-network/value-payload-plugin'
import { isValuesPayload, Values } from '@xyo-network/values-payload-plugin'

export type TransformDivinerParams = DivinerParams<AnyConfigSchema<TransformDivinerConfig>>

export abstract class AbstractTransformDiviner<TParams extends TransformDivinerParams = TransformDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [TransformDivinerConfigSchema]

  protected abstract get transformer(): PayloadValueTransformer

  protected override divineHandler(payloads?: Payload[]): Payload[] {
    const query = payloads?.find<TransformDivinerQueryPayload>(isTransformDivinerQueryPayload)
    if (!query) return []
    const values = payloads?.filter<Values>(isValuesPayload) || []
    const transformedValues: Value[] = values.map(this.transformer).map((value) => {
      return { schema: ValueSchema, value }
    })
    return transformedValues
  }
}
