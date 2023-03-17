import { assertEx } from '@xylabs/assert'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { QueryBoundWitnessWrapper } from '@xyo-network/module'
import { XyoQueryBoundWitness } from '@xyo-network/module-model'

export const getArchive = <T extends BoundWitness | BoundWitnessWrapper | XyoQueryBoundWitness | QueryBoundWitnessWrapper>(bw: T): string => {
  const { addresses } = bw
  return assertEx([...addresses].sort().join('|'), 'missing addresses for query')
}

export const getArchives = <T extends BoundWitness | BoundWitnessWrapper | XyoQueryBoundWitness | QueryBoundWitnessWrapper>(bw: T): string[] => {
  const { addresses } = bw
  assertEx(addresses.length, 'missing addresses for query')
  return addresses
}
