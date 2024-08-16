import { hexFrom } from '@xylabs/hex'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type { DivinerParams } from '@xyo-network/diviner-model'
import type {
  BigIntPayload,
  BigIntRangePayload,
  NumberPayload,
  NumberRangePayload,
  RangeDivinerConfig,
  RangePayload } from '@xyo-network/diviner-range-model'
import {
  BigIntSchema,
  isBigIntRangePayload,
  isNumberRangePayload,
  isRangePayload,
  NumberSchema,
  RangeDivinerConfigSchema,
} from '@xyo-network/diviner-range-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'
import type { Schema } from '@xyo-network/payload-model'

export type RangeDivinerParams = DivinerParams<AnyConfigSchema<RangeDivinerConfig>>

export class RangeDiviner<TParams extends RangeDivinerParams = RangeDivinerParams> extends AbstractDiviner<
  TParams,
  RangePayload,
  NumberPayload | BigIntPayload
> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, RangeDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = RangeDivinerConfigSchema

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
