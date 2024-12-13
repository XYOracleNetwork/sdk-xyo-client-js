import { type Hex, toHex } from '@xylabs/hex'

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

  static parse(hexString: string): StorageMetaWrapper {
    return new this(hexString)
  }

  address(): Hex {
    const offset = StorageMetaConstants.epochBytes + StorageMetaConstants.nonceBytes
    return toHex(this.getBytesSection(offset, StorageMetaConstants.qualifiedSequenceBytes).buffer, { prefix: false })
  }

  hash(): Hex {
    return toHex(this.getBytesSection(StorageMetaConstants.epochBytes, StorageMetaConstants.qualifiedSequenceBytes).buffer, { prefix: false })
  }

  localSequence(): Hex {
    return toHex(this.getBytesSection(0, StorageMetaConstants.localSequenceBytes).buffer, { prefix: false })
  }

  qualifiedSequence(): Hex {
    return toHex(this.getBytesSection(0, StorageMetaConstants.qualifiedSequenceBytes).buffer, { prefix: false })
  }

  timestamp(): Hex {
    return toHex(this.getBytesSection(0, StorageMetaConstants.addressBytes).buffer, { prefix: false })
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
