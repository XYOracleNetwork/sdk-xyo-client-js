import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerParams } from '@xyo-network/diviner-model'
import {
  isRangeDivinerQuery,
  NumberPayload,
  NumberSchema,
  RangeDivinerConfig,
  RangeDivinerConfigSchema,
  RangeDivinerQuery,
} from '@xyo-network/diviner-range-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

export type RangeDivinerParams = DivinerParams<AnyConfigSchema<RangeDivinerConfig>>

export class RangeDiviner<TParams extends RangeDivinerParams = RangeDivinerParams> extends AbstractDiviner<
  TParams,
  RangeDivinerQuery,
  NumberPayload
> {
  static override configSchemas = [RangeDivinerConfigSchema]

  protected override divineHandler(ranges?: RangeDivinerQuery[]): NumberPayload[] {
    const result: NumberPayload[] = []
    ranges?.filter(isRangeDivinerQuery).forEach((range) => {
      for (let i = 0; i < range.count; i++) {
        const payload: NumberPayload = {
          schema: NumberSchema,
          value: range.start + i,
        }
        result.push(payload)
      }
    })
    return result
  }
}
