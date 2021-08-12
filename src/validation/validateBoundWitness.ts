import { assertEx } from '@xyo-network/sdk-xyo-js'

import { XyoBoundWitness } from '../models'
import validateBoundWitnessBodyHash from './validateBoundWitnessBodyHash'

const validateBoundWitness = (bw: XyoBoundWitness) => {
  assertEx(bw._timestamp !== undefined, 'Missing _timestamp')
  assertEx((bw._timestamp ?? 0) > 1609459200, '_timestamp is before year 2021')
  assertEx((bw._timestamp ?? 4102444800) < 4102444800, '_timestamp is after year 2100')

  validateBoundWitnessBodyHash(bw)
}

export default validateBoundWitness
