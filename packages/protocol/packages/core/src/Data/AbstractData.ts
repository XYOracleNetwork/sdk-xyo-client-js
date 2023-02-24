import { BigNumber } from '@xylabs/bignumber'
import { Buffer } from '@xylabs/buffer'

export abstract class XyoAbstractData {
  private _isXyoData = true

  get length() {
    return this.bytes.length
  }

  abstract get bn(): BigNumber

  abstract get buffer(): Buffer

  abstract get bytes(): Uint8Array

  abstract get hex(): string

  abstract get keccak256(): Buffer

  static isXyoData(value: unknown) {
    return (value as XyoAbstractData)._isXyoData
  }
}
