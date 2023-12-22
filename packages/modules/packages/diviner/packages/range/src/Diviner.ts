import { hexFrom } from '@xylabs/hex'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerParams } from '@xyo-network/diviner-model'
import {
  BigIntPayload,
  BigIntRangePayload,
  BigIntSchema,
  isBigIntRangePayload,
  isNumberRangePayload,
  isRangePayload,
  NumberPayload,
  NumberRangePayload,
  NumberSchema,
  RangeDivinerConfig,
  RangeDivinerConfigSchema,
  RangePayload,
} from '@xyo-network/diviner-range-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

export type RangeDivinerParams = DivinerParams<AnyConfigSchema<RangeDivinerConfig>>

export class RangeDiviner<TParams extends RangeDivinerParams = RangeDivinerParams> extends AbstractDiviner<
  TParams,
  RangePayload,
  NumberPayload | BigIntPayload
> {
  static override configSchemas = [RangeDivinerConfigSchema]

  get ranges() {
    return this.config.ranges
  }

  protected static generateBigIntRange(range: BigIntRangePayload): BigIntPayload[] {
    const result: BigIntPayload[] = []
    const count = BigInt(range.count)
    const start = BigInt(hexFrom(range.start, { prefix: true }))
    for (let i = 0n; i < count; i++) {
      const payload: BigIntPayload = {
        schema: BigIntSchema,
        value: hexFrom(start + i, { prefix: true }),
      }
      result.push(payload)
    }
    return result
  }

  protected static generateNumberRange(range: NumberRangePayload): NumberPayload[] {
    const result: NumberPayload[] = []
    const count = range.count
    const start = range.start
    for (let i = 0; i < count; i++) {
      const payload: NumberPayload = {
        schema: NumberSchema,
        value: start + i,
      }
      result.push(payload)
    }
    return result
  }

  protected override divineHandler(ranges?: RangePayload[]): (NumberPayload | BigIntPayload)[] {
    const result: (BigIntPayload | NumberPayload)[] = []
    for (const range of ranges?.filter(isRangePayload) ?? []) {
      if (isBigIntRangePayload(range)) {
        result.push(...RangeDiviner.generateBigIntRange(range))
      } else if (isNumberRangePayload(range)) {
        result.push(...RangeDiviner.generateNumberRange(range))
      } else {
        throw new Error(`Only number and bigint ranges are supported: ${JSON.stringify(range, null, 2)}`)
      }
    }
    return result
  }
}
