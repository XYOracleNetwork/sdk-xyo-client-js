import { BigNumber } from '@xylabs/bignumber'
import { Buffer } from '@xylabs/buffer'

export abstract class AbstractData {
  private _isData = true

  get length() {
    return this.bytes.length
  }

  abstract get bn(): BigNumber

  abstract get buffer(): Buffer

  abstract get bytes(): Uint8Array

  abstract get hex(): string

  abstract get keccak256(): Buffer

  static isData(value: unknown) {
    return (value as AbstractData)._isData
  }
}
