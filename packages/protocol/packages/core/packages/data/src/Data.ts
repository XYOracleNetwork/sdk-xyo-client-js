/* eslint-disable import/no-deprecated */
import { base16, base58 } from '@scure/base'
import { toArrayBuffer, toUint8Array } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import { keccak256 } from 'ethers'

import { AbstractData } from './AbstractData'

export class Data extends AbstractData {
  private _bytes?: ArrayBuffer
  private _length: number

  constructor(length: number, bytes: ArrayBuffer, base?: number) {
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
    return toArrayBuffer(keccak256(new Uint8Array(this.bytes)))
  }

  static from(data: ArrayBuffer | undefined) {
    return data ? new Data(data.byteLength, data) : undefined
  }

  private checkLength() {
    assertEx(this.bytes.byteLength === this._length, `Length Mismatch: ${this.bytes.byteLength} !== ${this._length}`)
  }
}
