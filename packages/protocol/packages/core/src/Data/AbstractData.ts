import { BigNumber } from '@xylabs/bignumber'
import { Buffer } from '@xylabs/buffer'

export abstract class XyoAbstractData {
  private _isXyoData = true

  public get length() {
    return this.bytes.length
  }

  public abstract get bn(): BigNumber

  public abstract get buffer(): Buffer

  public abstract get bytes(): Uint8Array

  public abstract get hex(): string

  public abstract get keccak256(): Buffer

  public static isXyoData(value: unknown) {
    return (value as XyoAbstractData)._isXyoData
  }
}
