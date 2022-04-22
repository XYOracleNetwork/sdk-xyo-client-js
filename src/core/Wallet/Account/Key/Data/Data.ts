import { assertEx, BigNumber, Buffer } from '@xylabs/sdk-js'
import keccak256 from 'keccak256'

import { XyoAbstractData } from './AbstractData'
import { toUint8ArrayOptional } from './toUint8Array'
import { XyoDataLike } from './XyoDataLike'

export class XyoData extends XyoAbstractData {
  private _bytes?: Uint8Array
  private _length: number
  constructor(length: number, bytes?: XyoDataLike) {
    super()
    this._bytes = toUint8ArrayOptional(bytes)
    this._length = length
  }

  private checkLength() {
    assertEx(this.bytes.length === this._length, `Length Mismatch: ${this.bytes.length} !== ${this._length}`)
  }

  public get hex() {
    this.checkLength()
    return Buffer.from(this.bytes).toString('hex').toLowerCase()
  }

  public get buffer() {
    this.checkLength()
    return Buffer.from(this.bytes)
  }

  public get bn() {
    this.checkLength()
    return new BigNumber(this.bytes)
  }

  public get bytes() {
    return assertEx(this._bytes, 'XyoData uninitialized')
  }

  public get keccak256() {
    this.checkLength()
    return Buffer.from(keccak256(`0x${this.buffer.toString('hex')}`))
  }
}
