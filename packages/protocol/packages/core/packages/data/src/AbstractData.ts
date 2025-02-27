import { Hex } from '@xylabs/hex'

export interface DataInstance {
  base58: string
  bytes: ArrayBufferLike
  hex: Hex
  keccak256: ArrayBufferLike
}

export abstract class AbstractData implements DataInstance {
  get length() {
    return this.bytes.byteLength
  }

  abstract get base58(): string

  abstract get bytes(): ArrayBufferLike

  abstract get hex(): Hex

  abstract get keccak256(): ArrayBufferLike

  static is(value: unknown): value is AbstractData {
    return value instanceof AbstractData
  }
}
