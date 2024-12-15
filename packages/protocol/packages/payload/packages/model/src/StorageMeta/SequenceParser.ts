import { toUint8Array } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import {
  type Address,
  type Hash, type Hex,
  isAddress,
  toHex,
} from '@xylabs/hex'

import type {
  Epoch, LocalSequence, Nonce, QualifiedSequence,
  Sequence,
} from './Sequence.ts'
import {
  isQualifiedSequence, isSequence, SequenceConstants,
} from './Sequence.ts'

export class SequenceParser {
  protected static privateConstructorKey = Date.now().toString()

  private readonly data: Readonly<Uint8Array>

  protected constructor(privateConstructorKey: string, hex: Hex) {
    assertEx(SequenceParser.privateConstructorKey === privateConstructorKey, () => 'Use create function instead of constructor')
    const paddedHex = toHex(hex, {
      prefix: false,
      bitLength: (hex.length <= SequenceConstants.localSequenceBytes * 2)
        ? SequenceConstants.localSequenceBytes * 8
        : SequenceConstants.qualifiedSequenceBytes * 8,
    })
    this.data = toUint8Array(paddedHex)
  }

  get address(): Address {
    const start = SequenceConstants.localSequenceBytes
    const end = SequenceConstants.qualifiedSequenceBytes
    return toHex(this.data.slice(start, end).buffer, { prefix: false })
  }

  get epoch(): Epoch {
    const start = 0
    const end = SequenceConstants.epochBytes
    return toHex(this.data.slice(start, end).buffer, { prefix: false })
  }

  get localSequence(): LocalSequence {
    const start = 0
    const end = SequenceConstants.localSequenceBytes
    return toHex(this.data.slice(start, end).buffer, { prefix: false })
  }

  get nonce(): Nonce {
    const start = SequenceConstants.epochBytes
    const end = SequenceConstants.localSequenceBytes
    return toHex(this.data.slice(start, end).buffer, { prefix: false })
  }

  get qualifiedSequence(): QualifiedSequence {
    const start = 0
    const end = SequenceConstants.qualifiedSequenceBytes
    return toHex(this.data.slice(start, end).buffer, { prefix: false })
  }

  static from(sequence: Sequence, address?: Address): SequenceParser
  static from(timestamp: Hex, hash: Hash, address?: Address): SequenceParser
  static from(timestamp: Hex, hash: Hex, address?: Address): SequenceParser
  static from(timestamp: Hex, nonce: Nonce, address?: Address): SequenceParser
  static from(timestamp: number, hash: Hash, address?: Address): SequenceParser
  static from(timestamp: number, hash: Hex, address?: Address): SequenceParser
  static from(timestamp: number, nonce: Nonce, address?: Address): SequenceParser
  static from(timestampOrSequence: Sequence | Hex | number, nonceOrAddress: Hash | Nonce, address?: Address): SequenceParser {
    if (isSequence(timestampOrSequence)) {
      if (nonceOrAddress) {
        assertEx(!isQualifiedSequence(timestampOrSequence), () => 'Providing both a qualified sequence and a address is not allowed')
        assertEx(isAddress(nonceOrAddress), () => 'Invalid address provided')
        return new this(SequenceParser.privateConstructorKey, (timestampOrSequence + address) as Hex)
      }
      return new this(SequenceParser.privateConstructorKey, timestampOrSequence)
    }
    const epoch = SequenceParser.toEpoch(timestampOrSequence)
    const nonce = SequenceParser.toNonce(nonceOrAddress)
    const addressHex: Hex = address ? toHex(address, { bitLength: SequenceConstants.addressBytes * 8 }) : '' as Hex
    const hexString = (epoch + nonce + addressHex) as Hex
    assertEx(isSequence(hexString), () => `Invalid sequence [${hexString}] [${epoch}, ${nonce}, ${addressHex}]`)
    return new this(SequenceParser.privateConstructorKey, hexString)
  }

  static parse(value: Hex | string | ArrayBufferLike): SequenceParser {
    const hex = toHex(value)
    if (isSequence(hex)) {
      return new this(SequenceParser.privateConstructorKey, hex)
    }
    throw new Error(`Invalid sequence [${value}]`)
  }

  // can convert a short number/hex to an epoch (treats it as the whole value) or extract an epoch from a sequence
  static toEpoch(value: number | Hex | Epoch): Epoch {
    assertEx(
      typeof value !== 'number' || Number.isInteger(value),
      () => 'Value must be in integer',
    )
    const hex = toHex(value, { prefix: false })
    if (hex.length <= SequenceConstants.epochBytes * 2) {
      return toHex(value, { prefix: false, bitLength: SequenceConstants.epochBytes * 8 }) as Epoch
    }
    if (isSequence(hex)) {
      return hex.slice(0, SequenceConstants.epochBytes * 2) as Epoch
    }
    throw new Error(`Value could not be converted to epoch [${hex}]`)
  }

  // can convert a short number/hex to a nonce (treats it as the whole value) or extract an nonce from a sequence
  static toNonce(value: Hash | Hex): Nonce {
    assertEx(
      typeof value !== 'number' || Number.isInteger(value),
      () => 'Value must be in integer',
    )
    const hex = toHex(value, { prefix: false })
    if (isSequence(hex)) {
      return hex.slice(SequenceConstants.epochBytes * 2, SequenceConstants.localSequenceBytes * 2) as Nonce
    }
    return toHex((hex as string).slice(-SequenceConstants.nonceBytes * 2), { prefix: false, bitLength: SequenceConstants.nonceBytes * 8 }) as Nonce
  }
}
