import type { Address, Hex } from '@xylabs/hex'
import { isHex } from '@xylabs/hex'

// we use Exclude to intentionally make the type not equal to string
export type LocalSequence = Hex & Exclude<string, 'reserved-local-sequence-value'>
export type QualifiedSequence = Hex & Exclude<string, 'reserved-qualified-sequence-value'>
export type Sequence = LocalSequence | QualifiedSequence

export type Epoch = Hex & Exclude<string, 'reserved-epoch-sequence-value'>

export const isEpoch = (value: unknown): value is Epoch => {
  return isHex(value) && (value as string).length === SequenceConstants.epochBytes * 2
}

export type Nonce = Hex & Exclude<string, 'reserved-nonce-sequence-value'>

export const isNonce = (value: unknown): value is Epoch => {
  return isHex(value) && (value as string).length === SequenceConstants.nonceBytes * 2
}

export const isLocalSequence = (value: unknown): value is Sequence => {
  return isHex(value) && (value as string).length === (SequenceConstants.localSequenceBytes) * 2
}

export const isQualifiedSequence = (value: unknown): value is Sequence => {
  return isHex(value) && (value as string).length === (SequenceConstants.qualifiedSequenceBytes) * 2
}

export const isSequence = (value: unknown): value is Sequence => {
  return isLocalSequence(value) || isQualifiedSequence(value)
}

export const SequenceComponentLengths = {
  epochBytes: 8,
  nonceBytes: 8,
  addressBytes: 20,
}

export const SequenceComponentMinMax = {
  minEpoch: '0'.repeat(SequenceComponentLengths.epochBytes) as Epoch,
  maxEpoch: 'f'.repeat(SequenceComponentLengths.epochBytes) as Epoch,
  minNonce: '0'.repeat(SequenceComponentLengths.nonceBytes) as Nonce,
  maxNonce: 'f'.repeat(SequenceComponentLengths.nonceBytes) as Nonce,
  minAddress: '0'.repeat(SequenceComponentLengths.addressBytes) as Address,
  maxAddress: 'f'.repeat(SequenceComponentLengths.addressBytes) as Address,
}

export const LocalSequenceConstants = {
  ...SequenceComponentLengths,
  ...SequenceComponentMinMax,
  localSequenceBytes: SequenceComponentLengths.epochBytes + SequenceComponentLengths.nonceBytes,
  minLocalSequence: SequenceComponentMinMax.minEpoch + SequenceComponentMinMax.minNonce as LocalSequence,
  maxLocalSequence: SequenceComponentMinMax.maxEpoch + SequenceComponentMinMax.maxNonce as LocalSequence,
}

export const QualifiedSequenceConstants = {
  qualifiedSequenceBytes: LocalSequenceConstants.localSequenceBytes + SequenceComponentLengths.addressBytes,
  minLocalSequence: LocalSequenceConstants.minLocalSequence + SequenceComponentMinMax.minAddress as QualifiedSequence,
  maxLocalSequence: LocalSequenceConstants.maxLocalSequence + SequenceComponentMinMax.maxAddress as QualifiedSequence,
}

export const SequenceConstants = {
  ...LocalSequenceConstants,
  ...QualifiedSequenceConstants,
}

// "11111111111111112222222222222222" is and example of a local sequence string

// "111111111111111122222222222222223333333333333333333333333333333333333333" is and example of a local sequence string
// epoch = "1111111111111111"
// nonce = "2222222222222222"
// address = "3333333333333333333333333333333333333333"
