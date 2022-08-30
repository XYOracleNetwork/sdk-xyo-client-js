import { Buffer } from '@xylabs/buffer'
import { BigNumber } from '@xylabs/sdk-js'

export abstract class XyoAbstractData {
  private _isXyoData = true
  public abstract get hex(): string

  public abstract get buffer(): Buffer

  public abstract get bn(): BigNumber

  public abstract get bytes(): Uint8Array

  public abstract get keccak256(): Buffer

  public get length() {
    return this.bytes.length
  }

  public static isXyoData(value: unknown) {
    return (value as XyoAbstractData)._isXyoData
  }
}
