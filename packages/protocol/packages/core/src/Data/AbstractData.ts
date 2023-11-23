import { BigNumber } from '@xylabs/bignumber'
import { Buffer } from '@xylabs/buffer'

/** @deprecated use ArrayBuffer and @xylabs/hex instead */
export abstract class AbstractData {
  get length() {
    return this.bytes.length
  }

  abstract get bn(): BigNumber

  abstract get buffer(): Buffer

  abstract get bytes(): Uint8Array

  abstract get hex(): string

  abstract get keccak256(): Buffer

  static is(value: unknown): value is AbstractData {
    return value instanceof AbstractData
  }
}
