import { base16, base58 } from '@scure/base'
import { assertEx } from '@xylabs/assert'
import { BigNumber } from '@xylabs/bignumber'
import { Buffer, bufferPolyfill } from '@xylabs/buffer'
import keccak256 from 'keccak256'

import { XyoAbstractData } from './AbstractData'
import { toUint8ArrayOptional } from './toUint8Array'
import { XyoDataLike } from './XyoDataLike'

export class XyoData extends XyoAbstractData {
  private _bytes?: Uint8Array
  private _length: number

  constructor(length: number, bytes?: XyoDataLike)
  constructor(length: number, bytes: string, base?: number)
  constructor(length: number, bytes?: XyoDataLike, base?: number) {
    super()
    this._bytes = toUint8ArrayOptional(bytes, length, base)
    this._length = length
  }

  public get base58() {
    this.checkLength()
    return base58.encode(this.bytes)
  }

  public get bn() {
    this.checkLength()
    return new BigNumber(this.bytes)
  }

  public get buffer() {
    this.checkLength()
    return Buffer.from(this.bytes)
  }

  public get bytes() {
    return assertEx(this._bytes, 'XyoData uninitialized')
  }

  public get hex() {
    this.checkLength()
    return base16.encode(this.bytes).toLowerCase()
  }

  public get keccak256() {
    bufferPolyfill()
    this.checkLength()
    return Buffer.from(keccak256(`0x${this.buffer.toString('hex')}`))
  }

  private checkLength() {
    assertEx(this.bytes.length === this._length, `Length Mismatch: ${this.bytes.length} !== ${this._length}`)
  }
}
