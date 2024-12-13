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

  // Returns the entire data as a hex string (without 0x prefix)
  build(): Hex {
    return toHex(Array.from(this.data, byte => byte.toString(16).padStart(2, '0')).join(''))
  }

  // Private method to return a section of data as a Uint8Array
  private getBytesSection(start: number, length: number): Uint8Array {
    return this.data.slice(start, start + length)
  }

  // Private method to return a section as a hex string
  private getHexSection(start: number, length: number): string {
    const slice = this.getBytesSection(start, length)
    return Array.from(slice, byte => byte.toString(16).padStart(2, '0')).join('')
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
