import { assertEx } from '@xylabs/assert'
import {
  asHex,
  type Hash, type Hex, toHex,
} from '@xylabs/hex'
import { assert } from 'vitest'

import { StorageMetaConstants } from './StorageMeta.ts'

export class StorageMetaWrapper {
  private readonly data: Readonly<Uint8Array>

  protected constructor(hexString: string) {
    if (hexString.length > StorageMetaConstants.localSequenceBytes) {
      const cleanHex = toHex(hexString, { prefix: false })
      this.data = this.hexStringToUint8Array(cleanHex)
    } else {
      const cleanHex = toHex(hexString, { prefix: false }) + '0'.repeat(StorageMetaConstants.qualifiedSequenceBytes - hexString.length)
      this.data = this.hexStringToUint8Array(cleanHex)
    }
  }

  static from(timestamp: Hex, hash: Hex, address?: Hex): StorageMetaWrapper
  static from(timestamp: number, hash: Hex, address?: Hex): StorageMetaWrapper
  static from(timestamp: Hex | number, hash: Hex, address?: Hex): StorageMetaWrapper
  static from(timestamp: Hex, hash: Hash, address?: Hex): StorageMetaWrapper
  static from(timestamp: number, hash: Hex, address?: Hex): StorageMetaWrapper
  static from(timestamp: Hex | number, hash: Hash | Hex, address?: Hex): StorageMetaWrapper {
    const epoch = StorageMetaWrapper.timestampToEpoch(timestamp)
    const nonce = StorageMetaWrapper.hashToNonce(hash)
    let hexString = epoch + nonce
    if (address) {
      const paddedAddressHex = address.padStart(StorageMetaConstants.addressBytes * 2, '0')
      hexString += paddedAddressHex
    }
    return new this(hexString)
  }

  static hashToNonce(hash: Hash | Hex): Hex {
    assert(hash.length > StorageMetaConstants.nonceBytes * 2, 'Hash must be at least 8 bytes')
    const truncatedHashHex = toHex(hash.slice(-(StorageMetaConstants.nonceBytes * 2)), { prefix: false })
    return truncatedHashHex
  }

  static parse(hexString: string): StorageMetaWrapper {
    return new this(hexString)
  }

  static timestampToEpoch(timestamp: number | Hex): Hex {
    const timestampHex = (typeof timestamp === 'number' ? toHex(timestamp, { prefix: false }) : timestamp)
    const paddedTimestampHex = assertEx(asHex(timestampHex.padStart(StorageMetaConstants.epochBytes * 2, '0')))
    return paddedTimestampHex
  }

  address(): Hex {
    const start = StorageMetaConstants.epochBytes + StorageMetaConstants.nonceBytes
    const length = StorageMetaConstants.addressBytes
    return toHex(this.getBytesSection(start, length).buffer, { prefix: false })
  }

  epoch(): Hex {
    const start = 0
    const length = StorageMetaConstants.epochBytes
    return toHex(this.getBytesSection(start, length).buffer, { prefix: false })
  }

  localSequence(): Hex {
    const start = 0
    const length = StorageMetaConstants.localSequenceBytes
    return toHex(this.getBytesSection(start, length).buffer, { prefix: false })
  }

  nonce(): Hex {
    const start = StorageMetaConstants.epochBytes
    const length = StorageMetaConstants.nonceBytes
    return toHex(this.getBytesSection(start, length).buffer, { prefix: false })
  }

  qualifiedSequence(): Hex {
    const start = 0
    const length = StorageMetaConstants.qualifiedSequenceBytes
    return toHex(this.getBytesSection(start, length).buffer, { prefix: false })
  }

  // Private method to return a section of data as a Uint8Array
  private getBytesSection(start: number, length: number): Uint8Array {
    return this.data.slice(start, start + length)
  }

  private hexStringToUint8Array(hexString: string): Uint8Array {
    // Remove optional 0x prefix
    const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString

    // Ensure even length
    if (cleanHex.length % 2 !== 0) {
      throw new Error('Hex string must have an even number of characters.')
    }

    const byteCount = cleanHex.length / 2
    const uint8Array = new Uint8Array(byteCount)

    for (let i = 0; i < byteCount; i++) {
      const byteHex = cleanHex.slice(i * 2, i * 2 + 2)
      uint8Array[i] = Number.parseInt(byteHex, 16)
    }

    return uint8Array
  }
}
