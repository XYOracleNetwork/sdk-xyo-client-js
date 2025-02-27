import type { Compare } from '@xylabs/object'

import { SequenceParser } from './Parser.ts'
import type { Sequence } from './Sequence.ts'

const local: Compare<Sequence> = (a, b) => {
  const aa = SequenceParser.from(a)
  const bb = SequenceParser.from(b)
  return aa.localSequence > bb.localSequence ? 1 : aa.localSequence < bb.localSequence ? -1 : 0
}

const qualified: Compare<Sequence> = (a, b) => {
  const aa = SequenceParser.from(a)
  const bb = SequenceParser.from(b)
  return aa.qualifiedSequence > bb.qualifiedSequence ? 1 : aa.qualifiedSequence < bb.qualifiedSequence ? -1 : 0
}

export const SequenceComparer = { local, qualified }
