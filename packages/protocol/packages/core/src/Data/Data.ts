/* eslint-disable import/no-deprecated */
import { base16, base58 } from '@scure/base'
import { assertEx } from '@xylabs/assert'
import { toHex } from '@xylabs/hex'
import { toUint8Array } from '@xyo-network/hash'
import keccak256 from 'keccak256'

import { AbstractData } from './AbstractData'
import { DataLike } from './DataLike'

export class Data extends AbstractData {
  private _bytes?: ArrayBuffer
  private _length: number

  constructor(length: number, bytes?: DataLike)
  constructor(length: number, bytes: string, base?: number)
  constructor(length: number, bytes?: DataLike, base?: number) {
    super()
    this._bytes = toUint8Array(bytes, length, base)
    this._length = length
  }

  get base58() {
    this.checkLength()
    return base58.encode(new Uint8Array(this.bytes))
  }

  get bytes() {
    return assertEx(this._bytes, 'Data uninitialized')
  }

  get hex() {
    this.checkLength()
    return base16.encode(new Uint8Array(this.bytes)).toLowerCase()
  }

  get keccak256() {
    this.checkLength()
    return Buffer.from(keccak256(`0x${toHex(this.bytes)}`))
  }

  static from(data: DataLike | undefined) {
    return data ? new Data(Data.lengthOf(data), data) : undefined
  }

  static lengthOf(data: DataLike): number {
    if (typeof data === 'string') {
      return data.length / 2
    } else if (data instanceof AbstractData) {
      return data.length
    } else {
      return typeof data.byteLength === 'function' ? data.byteLength : data.byteLength
    }
  }

  private checkLength() {
    assertEx(this.bytes.byteLength === this._length, `Length Mismatch: ${this.bytes.byteLength} !== ${this._length}`)
  }
}
