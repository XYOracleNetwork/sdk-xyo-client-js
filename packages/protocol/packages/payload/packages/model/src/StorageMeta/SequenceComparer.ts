import type { Payload } from '../Payload.ts'
import { SequenceParser } from './SequenceParser.ts'
import type { WithStorageMeta } from './StorageMeta.ts'

// Returns a negative number if x < y, zero if x == y, and a positive number if x > y
export type Compare<T> = (x: T, y: T) => number

const local: Compare<WithStorageMeta<Payload>> = (a, b) => {
  const aa = SequenceParser.from(a._sequence)
  const bb = SequenceParser.from(b._sequence)
  return aa.localSequence > bb.localSequence ? 1 : aa.localSequence < bb.localSequence ? -1 : 0
}

const qualified: Compare<WithStorageMeta<Payload>> = (a, b) => {
  const aa = SequenceParser.from(a._sequence)
  const bb = SequenceParser.from(b._sequence)
  return aa.qualifiedSequence > bb.qualifiedSequence ? 1 : aa.qualifiedSequence < bb.qualifiedSequence ? -1 : 0
}

export const SequenceComparer = { local, qualified }
